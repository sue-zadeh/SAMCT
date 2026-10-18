using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;
using server.Models;

namespace server.Security;

public sealed class JwtAuthentication
{
    public const string Issuer = "SAMCT";
    public const string Audience = "SAMCT.Portal";
    public SymmetricSecurityKey SigningKey { get; }
    public string CookieName { get; }
    private readonly bool localEnvironment;

    public JwtAuthentication(IConfiguration configuration, IWebHostEnvironment environment)
    {
        localEnvironment = environment.IsDevelopment() || environment.IsEnvironment("Testing");
        CookieName = localEnvironment ? "Samct.Auth" : "__Host-Samct.Auth";
        var configuredKey = configuration["Jwt:SigningKey"];
        byte[] key;
        if (string.IsNullOrWhiteSpace(configuredKey)) {
            if (!localEnvironment) throw new InvalidOperationException("Set Jwt__SigningKey to a base64-encoded random key of at least 32 bytes.");
            // Local development needs no shared/default secret. Restarting signs local sessions out.
            key = RandomNumberGenerator.GetBytes(32);
        } else {
            try { key = Convert.FromBase64String(configuredKey); }
            catch (FormatException) { throw new InvalidOperationException("Jwt__SigningKey must be base64-encoded."); }
            if (key.Length < 32) throw new InvalidOperationException("Jwt__SigningKey must contain at least 32 random bytes.");
        }
        SigningKey = new SymmetricSecurityKey(key);
    }

    public TokenValidationParameters ValidationParameters => new() {
        ValidateIssuer = true, ValidIssuer = Issuer,
        ValidateAudience = true, ValidAudience = Audience,
        ValidateIssuerSigningKey = true, IssuerSigningKey = SigningKey,
        RequireSignedTokens = true, ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
        ValidateLifetime = true, RequireExpirationTime = true, ClockSkew = TimeSpan.Zero
    };

    private CookieOptions CookieOptions(DateTime? expires = null) => new() {
        HttpOnly = true, Secure = !localEnvironment, SameSite = SameSiteMode.Lax,
        Path = "/", Expires = expires
    };

    public void SignIn(User user, AuthSession session, HttpContext context)
    {
        var now = DateTime.UtcNow;
        // The database enforces the shorter sliding idle deadline. This is an absolute limit.
        var expires = now.AddHours(8);
        var token = new JwtSecurityToken(Issuer, Audience, [
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString(CultureInfo.InvariantCulture)),
            new Claim(JwtRegisteredClaimNames.Jti, session.Id),
            new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture), ClaimValueTypes.Integer64),
            new Claim("session", session.Id)
        ], now, expires, new SigningCredentials(SigningKey, SecurityAlgorithms.HmacSha256));
        context.Response.Cookies.Append(CookieName, new JwtSecurityTokenHandler().WriteToken(token), CookieOptions(expires));
        ClearLegacyChallenge(context);
    }

    public void SignOut(HttpContext context)
    {
        context.Response.Cookies.Delete(CookieName, CookieOptions());
        ClearLegacyChallenge(context);
    }

    private void ClearLegacyChallenge(HttpContext context) => context.Response.Cookies.Delete(
        localEnvironment ? "Samct.Mfa" : "__Host-Samct.Mfa", CookieOptions());
}
