using backend.Controllers;
using backend.DTOs.Auth;
using backend.Models;
using backend.Tests.TestHelpers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Tests.Controllers;

public class AuthControllerTests
{
    [Fact]
    public async Task Register_ReturnsCreatedResponse()
    {
        using var context = TestDbContextFactory.CreateContext();
        var authService = new FakeAuthService
        {
            RegisterHandler = _ => Task.FromResult(
                new AuthResponse
                {
                    UserId = 1,
                    Username = "alice",
                    Token = "token"
                }
            )
        };

        var controller = new AuthController(authService, context);

        var result = await controller.Register(
            new RegisterRequest
            {
                Username = "alice",
                Password = "password123"
            }
        );

        var objectResult = Assert.IsType<ObjectResult>(result.Result);

        Assert.Equal(201, objectResult.StatusCode);
        Assert.IsType<AuthResponse>(objectResult.Value);
    }

    [Fact]
    public async Task Register_ReturnsConflictWhenServiceThrows()
    {
        using var context = TestDbContextFactory.CreateContext();
        var authService = new FakeAuthService
        {
            RegisterHandler = _ => throw new InvalidOperationException(
                "Username is already in use."
            )
        };

        var controller = new AuthController(authService, context);

        var result = await controller.Register(
            new RegisterRequest
            {
                Username = "alice",
                Password = "password123"
            }
        );

        Assert.IsType<ConflictObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorizedWhenCredentialsAreInvalid()
    {
        using var context = TestDbContextFactory.CreateContext();
        var authService = new FakeAuthService
        {
            LoginHandler = _ => Task.FromResult<AuthResponse?>(null)
        };

        var controller = new AuthController(authService, context);

        var result = await controller.Login(
            new LoginRequest
            {
                Username = "alice",
                Password = "wrong-password"
            }
        );

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_ReturnsOkWhenCredentialsAreValid()
    {
        using var context = TestDbContextFactory.CreateContext();
        var authService = new FakeAuthService
        {
            LoginHandler = _ => Task.FromResult<AuthResponse?>(
                new AuthResponse
                {
                    UserId = 1,
                    Username = "alice",
                    Token = "token"
                }
            )
        };

        var controller = new AuthController(authService, context);

        var result = await controller.Login(
            new LoginRequest
            {
                Username = "alice",
                Password = "password123"
            }
        );

        var okResult = Assert.IsType<OkObjectResult>(result.Result);

        Assert.IsType<AuthResponse>(okResult.Value);
    }

    [Fact]
    public async Task GetCurrentUser_ReturnsUnauthorizedWhenUserClaimIsInvalid()
    {
        using var context = TestDbContextFactory.CreateContext();
        var controller = new AuthController(
            new FakeAuthService(),
            context
        )
        {
            ControllerContext = ControllerTestHelper.CreateControllerContext(null)
        };

        var result = await controller.GetCurrentUser();

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetCurrentUser_ReturnsNotFoundWhenUserDoesNotExist()
    {
        using var context = TestDbContextFactory.CreateContext();
        var controller = new AuthController(
            new FakeAuthService(),
            context
        )
        {
            ControllerContext = ControllerTestHelper.CreateControllerContext(99)
        };

        var result = await controller.GetCurrentUser();

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetCurrentUser_ReturnsCurrentUserResponse()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.Users.Add(
            new ApplicationUser
            {
                Id = 1,
                Username = "alice",
                PasswordHash = "hash"
            }
        );
        await context.SaveChangesAsync();

        var controller = new AuthController(
            new FakeAuthService(),
            context
        )
        {
            ControllerContext = ControllerTestHelper.CreateControllerContext(1)
        };

        var result = await controller.GetCurrentUser();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<CurrentUserResponse>(okResult.Value);

        Assert.Equal(1, response.UserId);
        Assert.Equal("alice", response.Username);
    }
}