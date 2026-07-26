using backend.DTOs.Auth;
using backend.Tests.TestHelpers;

namespace backend.Tests.DTOs;

public class AuthRequestValidationTests
{
    [Fact]
    public void RegisterRequest_FailsWhenUsernameIsTooShort()
    {
        var results = ValidationTestHelper.Validate(
            new RegisterRequest
            {
                Username = "ab",
                Password = "password123"
            }
        );

        Assert.Contains(
            results,
            result => result.ErrorMessage == "Username must be between 3 and 50 characters."
        );
    }

    [Fact]
    public void RegisterRequest_FailsWhenPasswordIsTooShort()
    {
        var results = ValidationTestHelper.Validate(
            new RegisterRequest
            {
                Username = "alice",
                Password = "short"
            }
        );

        Assert.Contains(
            results,
            result => result.ErrorMessage == "Password must be at least 8 characters."
        );
    }

    [Fact]
    public void LoginRequest_FailsWhenRequiredFieldsAreMissing()
    {
        var results = ValidationTestHelper.Validate(
            new LoginRequest()
        );

        Assert.Equal(2, results.Count);
    }
}