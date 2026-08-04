using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace backend.Helpers;

public static class UserClaimsHelper
{
    public static bool TryGetUserId(
        ClaimsPrincipal user,
        out int userId)
    {
        var userIdClaim =
            user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue(JwtRegisteredClaimNames.Sub);

        return int.TryParse(userIdClaim, out userId);
    }
}