using backend.Models;
using backend.Services;

namespace backend.Tests.TestHelpers;

internal sealed class FakeTokenService : ITokenService
{
    public string TokenToReturn { get; set; } = "fake-jwt-token";

    public ApplicationUser? LastUser { get; private set; }

    public DateTime? LastExpiresAt { get; private set; }

    public string CreateToken(
        ApplicationUser user,
        DateTime expiresAt)
    {
        LastUser = user;
        LastExpiresAt = expiresAt;
        return TokenToReturn;
    }
}