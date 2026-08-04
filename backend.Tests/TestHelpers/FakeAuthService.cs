using backend.DTOs.Auth;
using backend.Services;

namespace backend.Tests.TestHelpers;

internal sealed class FakeAuthService : IAuthService
{
    public Func<RegisterRequest, Task<AuthResponse>>? RegisterHandler
    {
        get;
        set;
    }

    public Func<LoginRequest, Task<AuthResponse?>>? LoginHandler
    {
        get;
        set;
    }

    public Task<AuthResponse> RegisterAsync(
        RegisterRequest request)
    {
        if (RegisterHandler is null)
        {
            throw new InvalidOperationException(
                "RegisterHandler was not configured."
            );
        }

        return RegisterHandler(request);
    }

    public Task<AuthResponse?> LoginAsync(
        LoginRequest request)
    {
        if (LoginHandler is null)
        {
            throw new InvalidOperationException(
                "LoginHandler was not configured."
            );
        }

        return LoginHandler(request);
    }
}