using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using OtpNet;
using server.Data;
using server.DTOs;
using server.Security;

namespace server.Controllers;

[ApiController, Route("api/mfa"), Authorize, EnableRateLimiting("auth")]
public class MfaController(AppDbContext database, MfaService mfa, ILogger<MfaController> logger) : ControllerBase
{
    [HttpGet("status")]
    public async Task<IActionResult> Status() {
        var user = await database.Users.SingleAsync(item => item.Id == User.UserId());
        return Ok(new { enabled = user.MfaSecret is not null, required = MfaService.Required(user), recoveryCodesRemaining = (user.MfaRecoveryCodeHashes ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries).Length });
    }

    [HttpPost("enroll")]
    public async Task<IActionResult> Enroll(MfaPasswordDto request) {
        await using var transaction = await database.Database.BeginTransactionAsync();
        var user = (await mfa.LockUser(User.UserId()))!;
        if (user.MfaSecret is not null) return Conflict(new { message = "Two-factor authentication is already enabled." });
        if (user.LockoutEnd > DateTime.UtcNow || !AuthController.Verify(request.CurrentPassword, user.PasswordHash)) {
            await mfa.Reject(user); await transaction.CommitAsync();
            return BadRequest(new { message = "Unable to verify your current password." });
        }
        await mfa.Challenge(user, HttpContext);
        await database.SaveChangesAsync(); await transaction.CommitAsync();
        return Accepted(new { twoFactorRequired = true, setupRequired = true });
    }

    [AllowAnonymous, HttpPost("setup")]
    public async Task<IActionResult> Setup() {
        await using var transaction = await database.Database.BeginTransactionAsync();
        var user = await mfa.ChallengeUser(HttpContext);
        if (user is null) return Unauthorized(new { message = "Please log in again to set up your authenticator." });
        if (user.MfaSecret is not null) return Conflict(new { message = "Your authenticator is already configured." });
        if (user.MfaPendingSecret is null || user.MfaPendingExpiresAt <= DateTime.UtcNow) {
            user.MfaPendingSecret = mfa.Protect(user, Base32Encoding.ToString(KeyGeneration.GenerateRandomKey(20)));
            user.MfaPendingExpiresAt = DateTime.UtcNow.AddMinutes(5);
        }
        var secret = mfa.Unprotect(user, user.MfaPendingSecret);
        await database.SaveChangesAsync(); await transaction.CommitAsync();
        return Ok(new { secret, account = user.UserName, issuer = "SAMCT", uri = new OtpUri(OtpType.Totp, secret, user.UserName, "SAMCT").ToString() });
    }

    [AllowAnonymous, HttpPost("complete")]
    public async Task<IActionResult> Complete(MfaCodeDto request) {
        await using var transaction = await database.Database.BeginTransactionAsync();
        var user = await mfa.ChallengeUser(HttpContext);
        if (user is null) return Unauthorized(new { message = "Verification expired. Please log in again." });
        var enrollment = user.MfaSecret is null;
        if (!mfa.VerifyCode(user, request, enrollment)) {
            await mfa.Reject(user); await transaction.CommitAsync();
            return Unauthorized(new { message = "The verification code is invalid or expired." });
        }
        string[] recoveryCodes = [];
        if (enrollment) {
            user.MfaSecret = user.MfaPendingSecret;
            recoveryCodes = MfaService.NewRecoveryCodes(user);
            await database.AuthSessions.Where(item => item.UserId == user.Id).ExecuteDeleteAsync();
        }
        user.MfaPendingSecret = null; user.MfaPendingExpiresAt = null;
        await database.MfaChallenges.Where(item => item.UserId == user.Id).ExecuteDeleteAsync();
        var session = await mfa.CreateSession(user, HttpContext, true);
        await transaction.CommitAsync();
        await mfa.SignIn(user, session, HttpContext);
        logger.LogInformation("Account {UserId} completed two-factor authentication; enrolled: {Enrolled}", user.Id, enrollment);
        return Ok(new { user = AuthController.MapUser(user), recoveryCodes });
    }

    [HttpPost("recovery-codes")]
    public Task<IActionResult> RecoveryCodes(MfaPasswordDto request) => Manage(request, disable: false);
    [HttpPost("disable")]
    public Task<IActionResult> Disable(MfaPasswordDto request) => Manage(request, disable: true);

    private async Task<IActionResult> Manage(MfaPasswordDto request, bool disable) {
        await using var transaction = await database.Database.BeginTransactionAsync();
        var user = (await mfa.LockUser(User.UserId()))!;
        if (disable && MfaService.Required(user)) return BadRequest(new { message = "Two-factor authentication is required for staff accounts." });
        if (user.MfaSecret is null || user.LockoutEnd > DateTime.UtcNow || !AuthController.Verify(request.CurrentPassword, user.PasswordHash) || !mfa.VerifyCode(user, request)) {
            await mfa.Reject(user); await transaction.CommitAsync();
            return BadRequest(new { message = "Your password and a current authenticator or recovery code are required." });
        }
        var recoveryCodes = disable ? [] : MfaService.NewRecoveryCodes(user);
        if (disable) { user.MfaSecret = null; user.MfaRecoveryCodeHashes = null; user.MfaLastTimeStep = null; }
        user.MfaPendingSecret = null; user.MfaPendingExpiresAt = null;
        user.FailedLoginAttempts = 0; user.LockoutEnd = null;
        await database.AuthSessions.Where(item => item.UserId == user.Id).ExecuteDeleteAsync();
        await database.MfaChallenges.Where(item => item.UserId == user.Id).ExecuteDeleteAsync();
        var session = await mfa.CreateSession(user, HttpContext, !disable);
        await transaction.CommitAsync();
        await mfa.SignIn(user, session, HttpContext);
        logger.LogInformation("Account {UserId} updated two-factor settings; disabled: {Disabled}", user.Id, disable);
        return Ok(new { recoveryCodes, message = "Security settings updated. Other sessions have been signed out." });
    }
}
