using backend.Models;

namespace backend.Services;

public interface ITokenService
{
    string CreateToken(
        ApplicationUser user,
        DateTime expiresAt
    );
}