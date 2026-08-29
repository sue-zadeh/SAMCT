using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using server.Models;

namespace server.Security;

public record AccessTokenResult(string Token, DateTime ExpiresAtUtc, string JwtId);

public interface ITokenService
{
    AccessTokenResult CreateAccessToken(User user);
}

public sealed class TokenService(IConfiguration configuration) : ITokenService
{
    public AccessTokenResult CreateAccessToken(User user)
    {
        var key = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key is not configured.");
        var issuer = configuration["Jwt:Issuer"] ?? "SAMCT";
        var audience = configuration["Jwt:Audience"] ?? "SAMCT.Web";
        var lifetimeMinutes = Math.Clamp(
            configuration.GetValue("Jwt:AccessTokenMinutes", 30), 5, 60);

        var expiresAtUtc = DateTime.UtcNow.AddMinutes(lifetimeMinutes);
        var jwtId = Guid.NewGuid().ToString("N");

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.UserName),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
            new("village", user.Village ?? ""),
            new("token_version", user.TokenVersion.ToString()),
            new(JwtRegisteredClaimNames.Jti, jwtId)
        };

        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAtUtc,
            signingCredentials);

        return new AccessTokenResult(
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAtUtc,
            jwtId);
    }
}
