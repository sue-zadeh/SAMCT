using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using server.Models;
using server.Security;

namespace server.tests;

public class TokenServiceTests
{
    [Fact]
    public void AccessTokenCarriesServerOwnedAuthorizationClaims()
    {
        const string signingKey = "test-only-signing-key-with-32-plus-chars";
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = signingKey,
                ["Jwt:Issuer"] = "SAMCT.Tests",
                ["Jwt:Audience"] = "SAMCT.Tests.Web",
                ["Jwt:AccessTokenMinutes"] = "15"
            })
            .Build();

        var user = new User
        {
            Id = 42,
            UserName = "synthetic.manager",
            Email = "manager@example.invalid",
            Role = SamctRoles.VillageManager,
            Village = "Ngatea",
            TokenVersion = 7
        };

        var result = new TokenService(configuration).CreateAccessToken(user);
        var token = new JwtSecurityTokenHandler().ReadJwtToken(result.Token);

        Assert.Equal("42", token.Claims.Single(claim =>
            claim.Type == ClaimTypes.NameIdentifier).Value);
        Assert.Equal(SamctRoles.VillageManager, token.Claims.Single(claim =>
            claim.Type == ClaimTypes.Role).Value);
        Assert.Equal("Ngatea", token.Claims.Single(claim => claim.Type == "village").Value);
        Assert.Equal("7", token.Claims.Single(claim => claim.Type == "token_version").Value);
        Assert.False(string.IsNullOrWhiteSpace(token.Id));
        Assert.True(result.ExpiresAtUtc > DateTime.UtcNow);
    }
}
