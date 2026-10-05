using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using OtpNet;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Security;

public class MfaService(AppDbContext database, IDataProtectionProvider protection, IWebHostEnvironment environment)
{
    // All administrative titles and village managers must complete two-factor authentication.
    public static bool Required(User user) => AccessRules.StaffRoles.Split(',').Contains(user.Role);
    public static bool NeedsChallenge(User user) => Required(user) || user.MfaSecret is not null;
    public static string Hash(string value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
    private string CookieName => environment.IsDevelopment() || environment.IsEnvironment("Testing") ? "Samct.Mfa" : "__Host-Samct.Mfa";
    private CookieOptions CookieOptions => new() { HttpOnly = true, Secure = !(environment.IsDevelopment() || environment.IsEnvironment("Testing")), SameSite = SameSiteMode.Strict, Path = "/", MaxAge = TimeSpan.FromMinutes(5) };
    private IDataProtector Protector(User user) => protection.CreateProtector("SAMCT.Authenticator.v1", user.Id.ToString(System.Globalization.CultureInfo.InvariantCulture));
    public string Protect(User user, string secret) => Protector(user).Protect(secret);
    public string Unprotect(User user, string secret) => Protector(user).Unprotect(secret);

    public async Task Challenge(User user, HttpContext context)
    {
        await database.MfaChallenges.Where(item => item.UserId == user.Id || item.ExpiresAt <= DateTime.UtcNow).ExecuteDeleteAsync();
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        database.MfaChallenges.Add(new MfaChallenge { Id = Hash(token), UserId = user.Id, PasswordStamp = Hash(user.PasswordHash), ExpiresAt = DateTime.UtcNow.AddMinutes(5) });
        context.Response.Cookies.Append(CookieName, token, CookieOptions);
    }

    // Caller holds a database transaction. Recheck the challenge after locking its user to prevent replay races.
    public async Task<User?> ChallengeUser(HttpContext context)
    {
        var token = context.Request.Cookies[CookieName];
        if (token is null || token.Length != 64) return null;
        var id = Hash(token);
        var challenge = await database.MfaChallenges.AsNoTracking().SingleOrDefaultAsync(item => item.Id == id && item.ExpiresAt > DateTime.UtcNow);
        if (challenge is null) return null;
        var user = await LockUser(challenge.UserId);
        if (user is null || !user.IsActive || !AccessRules.Roles.Contains(user.Role) || user.LockoutEnd > DateTime.UtcNow || challenge.PasswordStamp != Hash(user.PasswordHash)) return null;
        if (!await database.MfaChallenges.AsNoTracking().AnyAsync(item => item.Id == id && item.ExpiresAt > DateTime.UtcNow)) return null;
        return user;
    }

    public Task<User?> LockUser(int id) => database.Users.FromSqlInterpolated($"SELECT * FROM \"Users\" WHERE \"Id\" = {id} FOR UPDATE").SingleOrDefaultAsync();

    public bool VerifyCode(User user, MfaCodeDto request, bool enrollment = false)
    {
        if (!string.IsNullOrWhiteSpace(request.RecoveryCode) && !enrollment && user.MfaSecret is not null) {
            var hash = Hash(request.RecoveryCode.Replace("-", "").ToUpperInvariant());
            var hashes = (user.MfaRecoveryCodeHashes ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
            var index = hashes.FindIndex(item => CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(item), Encoding.ASCII.GetBytes(hash)));
            if (index < 0) return false;
            hashes.RemoveAt(index);
            user.MfaRecoveryCodeHashes = string.Join(',', hashes);
            return true;
        }
        var encrypted = enrollment ? user.MfaPendingSecret : user.MfaSecret;
        if (encrypted is null || request.Code is null || (enrollment && !(user.MfaPendingExpiresAt > DateTime.UtcNow))) return false;
        try {
            var otp = new Totp(Base32Encoding.ToBytes(Unprotect(user, encrypted)));
            if (!otp.VerifyTotp(request.Code, out var step, new VerificationWindow(previous: 1, future: 1)) || step <= (user.MfaLastTimeStep ?? -1)) return false;
            user.MfaLastTimeStep = step;
            return true;
        } catch (CryptographicException) { return false; }
    }

    public static string[] NewRecoveryCodes(User user)
    {
        var codes = Enumerable.Range(0, 10).Select(_ => Convert.ToHexString(RandomNumberGenerator.GetBytes(16))).ToArray();
        user.MfaRecoveryCodeHashes = string.Join(',', codes.Select(Hash));
        return codes;
    }

    public async Task Reject(User user)
    {
        if (user.LockoutEnd <= DateTime.UtcNow) { user.LockoutEnd = null; user.FailedLoginAttempts = 0; }
        user.FailedLoginAttempts++;
        if (user.FailedLoginAttempts >= 5) {
            user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
            await database.MfaChallenges.Where(item => item.UserId == user.Id).ExecuteDeleteAsync();
        }
        await database.SaveChangesAsync();
    }

    public async Task<AuthSession> CreateSession(User user, HttpContext context, bool verified)
    {
        user.FailedLoginAttempts = 0; user.LockoutEnd = null;
        var old = context.User.FindFirst("session")?.Value;
        await database.AuthSessions.Where(item => item.Id == old || item.ExpiresAt <= DateTime.UtcNow).ExecuteDeleteAsync();
        var session = new AuthSession { Id = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)), UserId = user.Id, ExpiresAt = DateTime.UtcNow.AddHours(8), MfaVerified = verified };
        database.AuthSessions.Add(session);
        await database.SaveChangesAsync();
        return session;
    }

    public async Task SignIn(User user, AuthSession session, HttpContext context)
    {
        context.Response.Cookies.Delete(CookieName, CookieOptions);
        await context.SignInAsync(AccessRules.Principal(user, session.Id), new AuthenticationProperties { ExpiresUtc = session.ExpiresAt });
    }
}
