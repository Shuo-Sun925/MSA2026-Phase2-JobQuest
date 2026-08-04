using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using backend.Models;
using backend.Services;
using Microsoft.Extensions.Configuration;

namespace backend.Tests.Services;

public class TokenServiceTests
{
    [Fact]
    public void CreateToken_ReturnsJwtWithExpectedClaims()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Jwt:Key"] = "super-secret-key-with-enough-length-12345",
                    ["Jwt:Issuer"] = "jobquest-api",
                    ["Jwt:Audience"] = "jobquest-client"
                }
            )
            .Build();

        var service = new TokenService(configuration);
        var expiresAt = DateTime.UtcNow.AddHours(2);

        var token = service.CreateToken(
            new ApplicationUser
            {
                Id = 42,
                Username = "alice"
            },
            expiresAt
        );

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Equal("jobquest-api", jwt.Issuer);
        Assert.Contains("jobquest-client", jwt.Audiences);
        Assert.Equal("42", jwt.Subject);
        Assert.Equal(
            "42",
            jwt.Claims.First(claim =>
                claim.Type == ClaimTypes.NameIdentifier
            ).Value
        );
        Assert.Equal(
            "alice",
            jwt.Claims.First(claim =>
                claim.Type == ClaimTypes.Name
            ).Value
        );
    }

    [Fact]
    public void CreateToken_ThrowsWhenKeyIsMissing()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Jwt:Issuer"] = "jobquest-api",
                    ["Jwt:Audience"] = "jobquest-client"
                }
            )
            .Build();

        var service = new TokenService(configuration);

        var exception = Assert.Throws<InvalidOperationException>(
            () => service.CreateToken(
                new ApplicationUser
                {
                    Id = 1,
                    Username = "alice"
                },
                DateTime.UtcNow.AddMinutes(10)
            )
        );

        Assert.Equal("JWT key was not configured.", exception.Message);
    }
}