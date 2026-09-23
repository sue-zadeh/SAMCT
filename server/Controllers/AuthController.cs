using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using server.Data;
using server.DTOs;
using server.Models;
using server.Security;
using server.Services;

namespace server.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class AuthController(AppDbContext database, IEmailService emailService, IConfiguration configuration,
    UploadStorage uploads, ILogger<AuthController> logger) : ControllerBase
{
    private static readonly string DummyHash = BCrypt.Net.BCrypt.HashPassword(Convert.ToHexString(RandomNumberGenerator.GetBytes(24)), 12);
    private static string Normalize(string value) => value.Trim().ToLowerInvariant();
    private static string TokenHash(string value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
    private static UserResponseDto MapUser(User user) => new() {
        Id = user.Id, UserName = user.UserName, FirstName = user.FirstName, LastName = user.LastName,
        FullName = user.FullName, Email = user.Email, Role = user.Role, Village = user.Village,
        ProfileImageUrl = user.ProfileImageUrl, IsActive = user.IsActive
    };
    private static bool Verify(string password, string hash) {
        try { return BCrypt.Net.BCrypt.Verify(password, hash); }
        catch (BCrypt.Net.SaltParseException) { return false; }
    }

    [AllowAnonymous, HttpGet("csrf")]
    public IActionResult Csrf([FromServices] IAntiforgery antiforgery) =>
        Ok(new { token = antiforgery.GetAndStoreTokens(HttpContext).RequestToken });

    [HttpGet("session")]
    public async Task<IActionResult> Session() => Ok(MapUser(await database.Users.SingleAsync(item => item.Id == User.UserId())));

    [AllowAnonymous, HttpPost("register"), EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromForm] RegisterRequestDto request)
    {
        var role = request.Role.Trim();
        var village = AccessRules.Villages.FirstOrDefault(item => item.Equals(request.Village.Trim(), StringComparison.OrdinalIgnoreCase));
        if (!AccessRules.Roles.Contains(role) || village is null)
            return BadRequest(new { message = "Select a valid role and village." });
        var staffCreation = User.IsAdmin() || User.IsInRole("VillageManager");
        if (!User.IsAdmin() && role != "Resident") return Forbid();
        if (User.IsInRole("VillageManager") && !User.CanManageVillage(village)) return Forbid();
        if (User.Identity?.IsAuthenticated == true && !staffCreation) return Forbid();
        var username = Normalize(request.UserName);
        var email = Normalize(request.Email);
        if (await database.Users.AnyAsync(item => item.UserName.Trim().ToLower() == username || item.Email.Trim().ToLower() == email))
            return Conflict(new { message = "Registration could not be completed with these details." });
        var user = new User {
            UserName = username, Email = email, FirstName = request.FirstName.Trim(), LastName = request.LastName.Trim(),
            FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}", Role = role, Village = village,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12), IsActive = staffCreation,
            ProfileImageUrl = await uploads.Save(request.ProfileImage, "profiles", imagesOnly: true)
        };
        database.Users.Add(user);
        try { await database.SaveChangesAsync(); }
        catch (DbUpdateException error) when (error.InnerException is PostgresException { SqlState: "23505" }) {
            return Conflict(new { message = "Registration could not be completed with these details." });
        }
        logger.LogInformation("Account {UserId} registered; approved: {Approved}; created by {ActorId}", user.Id, user.IsActive, User.UserId());
        return Ok(new { message = staffCreation ? "User registered successfully." : "Registration received. Your village manager or administrator must approve your account before you can log in." });
    }

    [AllowAnonymous, HttpPost("login"), EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (Encoding.UTF8.GetByteCount(request.Password) > 72) return Unauthorized(new { message = "Invalid username or password." });
        var username = Normalize(request.UserName);
        await using var transaction = await database.Database.BeginTransactionAsync();
        // Lock the account row so simultaneous attempts cannot bypass the lockout counter.
        var user = await database.Users.FromSqlInterpolated($"SELECT * FROM \"Users\" WHERE lower(btrim(\"UserName\")) = {username} FOR UPDATE").SingleOrDefaultAsync();
        var correctPassword = Verify(request.Password, user?.PasswordHash ?? DummyHash);
        if (user is null || !user.IsActive || user.LockoutEnd > DateTime.UtcNow || !correctPassword || !AccessRules.Roles.Contains(user.Role)) {
            if (user is not null && user.IsActive && user.LockoutEnd <= DateTime.UtcNow) { user.FailedLoginAttempts = 0; user.LockoutEnd = null; }
            if (user is not null && user.IsActive && user.LockoutEnd is null) {
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 5) user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                await database.SaveChangesAsync();
            }
            await transaction.CommitAsync();
            logger.LogWarning("Login rejected");
            return Unauthorized(new { message = "Invalid username or password." });
        }
        user.FailedLoginAttempts = 0;
        user.LockoutEnd = null;
        var oldSession = User.FindFirst("session")?.Value;
        if (oldSession is not null) await database.AuthSessions.Where(item => item.Id == oldSession).ExecuteDeleteAsync();
        await database.AuthSessions.Where(item => item.ExpiresAt <= DateTime.UtcNow).ExecuteDeleteAsync();
        var session = new AuthSession { Id = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)), UserId = user.Id, ExpiresAt = DateTime.UtcNow.AddHours(8) };
        database.AuthSessions.Add(session);
        await database.SaveChangesAsync();
        await transaction.CommitAsync();
        await HttpContext.SignInAsync(AccessRules.Principal(user, session.Id), new AuthenticationProperties { ExpiresUtc = session.ExpiresAt });
        logger.LogInformation("Account {UserId} logged in", user.Id);
        return Ok(MapUser(user));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout() {
        var sessionId = User.FindFirst("session")?.Value;
        await database.AuthSessions.Where(item => item.Id == sessionId).ExecuteDeleteAsync();
        await HttpContext.SignOutAsync();
        return Ok(new { message = "Logged out." });
    }

    [Authorize(Roles = AccessRules.AdminRoles), HttpGet("users")]
    public async Task<IActionResult> GetAllUsers() => Ok((await database.Users.AsNoTracking().OrderBy(item => item.Role).ThenBy(item => item.FirstName).ToListAsync()).Select(MapUser));

    [Authorize(Roles = AccessRules.StaffRoles), HttpGet("users/by-village/{village}")]
    public async Task<IActionResult> GetUsersByVillage(string village) {
        if (!User.CanManageVillage(village)) return Forbid();
        var users = await database.Users.AsNoTracking().Where(item => item.Village == village &&
            (item.Role == "Resident" || item.Role == "VillageManager")).OrderBy(item => item.FirstName).ToListAsync();
        return Ok(users.Select(MapUser));
    }

    [HttpGet("users/profile/{username}")]
    public async Task<IActionResult> GetProfile(string username) {
        if (!User.IsSelf(username)) return Forbid();
        return await Session();
    }

    [HttpPut("users/profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request) {
        if (!User.IsSelf(request.CurrentUsername)) return Forbid();
        var user = await database.Users.SingleAsync(item => item.Id == User.UserId());
        // A village change is an access change; only the staff management endpoint may do this.
        if (request.Village != user.Village) return Forbid();
        if (Normalize(request.Email) != Normalize(user.Email) && !Verify(request.CurrentPassword ?? "", user.PasswordHash))
            return BadRequest(new { message = "Enter your current password to change your email address." });
        if (await IdentityExists(request.UserName, request.Email, user.Id)) return Conflict(new { message = "These account details are already in use." });
        user.UserName = Normalize(request.UserName); user.Email = Normalize(request.Email);
        user.FirstName = request.FirstName.Trim(); user.LastName = request.LastName.Trim(); user.FullName = $"{user.FirstName} {user.LastName}";
        await database.SaveChangesAsync();
        return Ok(MapUser(user));
    }

    [HttpPut("users/password"), EnableRateLimiting("auth")]
    public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequestDto request) {
        if (!User.IsSelf(request.UserName)) return Forbid();
        var user = await database.Users.SingleAsync(item => item.Id == User.UserId());
        if (!Verify(request.CurrentPassword, user.PasswordHash)) return BadRequest(new { message = "Current password is incorrect." });
        await using var transaction = await database.Database.BeginTransactionAsync();
        var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, 12);
        var changed = await database.Users.Where(item => item.Id == user.Id && item.PasswordHash == user.PasswordHash)
            .ExecuteUpdateAsync(update => update.SetProperty(item => item.PasswordHash, newHash)
                .SetProperty(item => item.PasswordResetToken, (string?)null).SetProperty(item => item.PasswordResetTokenExpiry, (DateTime?)null));
        if (changed != 1) return BadRequest(new { message = "Please sign in again before changing your password." });
        await database.AuthSessions.Where(item => item.UserId == user.Id).ExecuteDeleteAsync();
        await transaction.CommitAsync();
        await HttpContext.SignOutAsync();
        return Ok(new { message = "Password updated. Please log in again." });
    }

    [HttpPost("users/profile-image")]
    public async Task<IActionResult> UpdateProfileImage([FromQuery] string username, IFormFile file) {
        if (!User.IsSelf(username)) return Forbid();
        var user = await database.Users.SingleAsync(item => item.Id == User.UserId());
        user.ProfileImageUrl = await uploads.Save(file, "profiles", imagesOnly: true);
        await database.SaveChangesAsync();
        return Ok(MapUser(user));
    }

    [Authorize(Roles = AccessRules.StaffRoles), HttpPut("users/{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UserResponseDto request) {
        var user = await database.Users.SingleOrDefaultAsync(item => item.Id == id);
        if (user is null) return NotFound();
        if (!User.IsAdmin() && (user.Role != "Resident" || request.Role != "Resident" ||
            !User.CanManageVillage(user.Village) || request.Village != user.Village)) return Forbid();
        if (!AccessRules.Roles.Contains(request.Role) || !AccessRules.Villages.Contains(request.Village))
            return BadRequest(new { message = "Select a valid role and village." });
        if (user.Id == User.UserId() && (!request.IsActive || request.Role != user.Role))
            return BadRequest(new { message = "Another administrator must change your own access." });
        if (await IdentityExists(request.UserName, request.Email, id)) return Conflict(new { message = "These account details are already in use." });
        var accessChanged = user.IsActive != request.IsActive || user.Role != request.Role || user.Village != request.Village || Normalize(user.Email) != Normalize(request.Email);
        user.UserName = Normalize(request.UserName); user.Email = Normalize(request.Email);
        user.FirstName = request.FirstName.Trim(); user.LastName = request.LastName.Trim(); user.FullName = $"{user.FirstName} {user.LastName}";
        user.Role = request.Role; user.Village = request.Village; user.IsActive = request.IsActive;
        await using var transaction = await database.Database.BeginTransactionAsync();
        if (accessChanged) {
            user.PasswordResetToken = null; user.PasswordResetTokenExpiry = null;
            await database.AuthSessions.Where(item => item.UserId == id).ExecuteDeleteAsync();
        }
        await database.SaveChangesAsync();
        await transaction.CommitAsync();
        logger.LogInformation("Account {UserId} updated by {ActorId}; access changed: {AccessChanged}", id, User.UserId(), accessChanged);
        return Ok(MapUser(user));
    }

    [Authorize(Roles = AccessRules.StaffRoles), HttpGet("village-manager/dashboard-stats/{village}")]
    public async Task<IActionResult> GetVillageDashboardStats(string village) {
        if (!User.CanManageVillage(village)) return Forbid();
        return Ok(new {
            openMaintenanceCount = await database.MaintenanceRequests.CountAsync(item => item.Village == village && item.Status != "Completed"),
            totalResidentsCount = await database.Users.CountAsync(item => item.Village == village && item.Role == "Resident" && item.IsActive),
            documentCount = await database.DocumentNotices.CountAsync(item => item.Village == village)
        });
    }

    [Authorize(Roles = AccessRules.StaffRoles), HttpGet("village/{village}/summary")]
    public async Task<IActionResult> GetVillageSummary(string village) {
        if (!User.CanManageVillage(village)) return Forbid();
        return Ok(new {
            residents = await database.Users.CountAsync(item => item.Village == village && item.Role == "Resident" && item.IsActive),
            managers = await database.Users.CountAsync(item => item.Village == village && item.Role == "VillageManager" && item.IsActive)
        });
    }

    [AllowAnonymous, HttpPost("forgot-password"), EnableRateLimiting("auth")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request) {
        const string response = "If this email exists, a reset link has been sent.";
        var email = Normalize(request.Email);
        var user = await database.Users.SingleOrDefaultAsync(item => item.Email.Trim().ToLower() == email && item.IsActive);
        if (user is null) return Ok(new { message = response });
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        user.PasswordResetToken = TokenHash(token);
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(30);
        await database.SaveChangesAsync();
        var frontendUrl = configuration["EmailSettings:FrontendUrl"]?.TrimEnd('/');
        try {
            if (!Uri.TryCreate(frontendUrl, UriKind.Absolute, out var address) ||
                (address.Scheme != "https" && !address.IsLoopback)) throw new InvalidOperationException("Reset URL is not configured.");
            await emailService.SendPasswordResetEmail(user.Email, $"{frontendUrl}/reset-password/{token}");
        } catch (Exception) {
            // Do not leak account existence or secrets from SMTP exceptions to the caller/logs.
            logger.LogError("Password reset email delivery failed for account {UserId}; check email configuration", user.Id);
        }
        return Ok(new { message = response });
    }

    [AllowAnonymous, HttpPut("reset-password"), EnableRateLimiting("auth")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request) {
        var hash = TokenHash(request.Token);
        await using var transaction = await database.Database.BeginTransactionAsync();
        var userId = await database.Users.Where(item => item.PasswordResetToken == hash && item.PasswordResetTokenExpiry > DateTime.UtcNow && item.IsActive)
            .Select(item => (int?)item.Id).SingleOrDefaultAsync();
        if (userId is null) return BadRequest(new { message = "Invalid or expired reset link." });
        var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, 12);
        var changed = await database.Users.Where(item => item.Id == userId && item.PasswordResetToken == hash && item.PasswordResetTokenExpiry > DateTime.UtcNow && item.IsActive)
            .ExecuteUpdateAsync(update => update.SetProperty(item => item.PasswordHash, newHash)
                .SetProperty(item => item.PasswordResetToken, (string?)null).SetProperty(item => item.PasswordResetTokenExpiry, (DateTime?)null)
                .SetProperty(item => item.FailedLoginAttempts, 0).SetProperty(item => item.LockoutEnd, (DateTime?)null));
        if (changed != 1) return BadRequest(new { message = "Invalid or expired reset link." });
        await database.AuthSessions.Where(item => item.UserId == userId).ExecuteDeleteAsync();
        await transaction.CommitAsync();
        await HttpContext.SignOutAsync();
        return Ok(new { message = "Password reset successfully. Please log in again." });
    }

    private Task<bool> IdentityExists(string username, string email, int exceptId) => database.Users.AnyAsync(item =>
        item.Id != exceptId && (item.UserName.Trim().ToLower() == Normalize(username) || item.Email.Trim().ToLower() == Normalize(email)));
}
