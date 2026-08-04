using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Models;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string CreateToken(
        ApplicationUser user,
        DateTime expiresAt)
    {
        var jwtKey = _configuration["Jwt:Key"];

        var jwtIssuer = _configuration["Jwt:Issuer"];

        var jwtAudience = _configuration["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            throw new InvalidOperationException(
                "JWT key was not configured."
            );
        }

        if (string.IsNullOrWhiteSpace(jwtIssuer))
        {
            throw new InvalidOperationException(
                "JWT issuer was not configured."
            );
        }

        if (string.IsNullOrWhiteSpace(jwtAudience))
        {
            throw new InvalidOperationException(
                "JWT audience was not configured."
            );
        }

        var claims = new List<Claim>
        {
            new(
                JwtRegisteredClaimNames.Sub,
                user.Id.ToString()
            ),

            new(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()
            ),

            new(
                ClaimTypes.Name,
                user.Username
            ),

            new(
                JwtRegisteredClaimNames.UniqueName,
                user.Username
            ),

            new(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString()
            )
        };

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        );

        var signingCredentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        var jwtToken = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: signingCredentials
        );

        return new JwtSecurityTokenHandler()
            .WriteToken(jwtToken);
    }
}