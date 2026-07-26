using backend.DTOs.Auth;
using backend.Models;
using backend.Services;
using backend.Tests.TestHelpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace backend.Tests.Services;

public class AuthServiceTests
{
    [Fact]
    public async Task RegisterAsync_CreatesUserProgressAndToken()
    {
        using var context = TestDbContextFactory.CreateContext();
        var passwordHasher = new PasswordHasher<ApplicationUser>();
        var tokenService = new FakeTokenService();
        var service = CreateService(context, passwordHasher, tokenService);

        var response = await service.RegisterAsync(
            new RegisterRequest
            {
                Username = "  Alice  ",
                Password = "password123"
            }
        );

        var user = Assert.Single(context.Users);
        var progress = Assert.Single(context.UserProgress);

        Assert.Equal("Alice", user.Username);
        Assert.NotEqual("password123", user.PasswordHash);
        Assert.Equal(user.Id, progress.UserId);
        Assert.Equal(1, progress.CurrentLevel);
        Assert.Equal("fake-jwt-token", response.Token);
        Assert.Equal(user.Id, response.UserId);
        Assert.Equal(user, tokenService.LastUser);
        Assert.NotNull(tokenService.LastExpiresAt);
    }

    [Fact]
    public async Task RegisterAsync_ThrowsWhenUsernameAlreadyExistsIgnoringCase()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.Users.Add(
            new ApplicationUser
            {
                Username = "alice",
                PasswordHash = "hash"
            }
        );
        await context.SaveChangesAsync();

        var service = CreateService(
            context,
            new PasswordHasher<ApplicationUser>(),
            new FakeTokenService()
        );

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.RegisterAsync(
                new RegisterRequest
                {
                    Username = "ALICE",
                    Password = "password123"
                }
            )
        );

        Assert.Equal("Username is already in use.", exception.Message);
    }

    [Fact]
    public async Task LoginAsync_ReturnsResponseForValidCredentials()
    {
        using var context = TestDbContextFactory.CreateContext();
        var passwordHasher = new PasswordHasher<ApplicationUser>();
        var user = new ApplicationUser
        {
            Username = "alice"
        };
        user.PasswordHash = passwordHasher.HashPassword(
            user,
            "password123"
        );
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var tokenService = new FakeTokenService();
        var service = CreateService(context, passwordHasher, tokenService);

        var response = await service.LoginAsync(
            new LoginRequest
            {
                Username = "  Alice  ",
                Password = "password123"
            }
        );

        Assert.NotNull(response);
        Assert.Equal(user.Id, response.UserId);
        Assert.Equal("fake-jwt-token", response.Token);
    }

    [Fact]
    public async Task LoginAsync_ReturnsNullForInvalidPassword()
    {
        using var context = TestDbContextFactory.CreateContext();
        var passwordHasher = new PasswordHasher<ApplicationUser>();
        var user = new ApplicationUser
        {
            Username = "alice"
        };
        user.PasswordHash = passwordHasher.HashPassword(
            user,
            "password123"
        );
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var service = CreateService(
            context,
            passwordHasher,
            new FakeTokenService()
        );

        var response = await service.LoginAsync(
            new LoginRequest
            {
                Username = "alice",
                Password = "wrong-password"
            }
        );

        Assert.Null(response);
    }

    [Fact]
    public async Task LoginAsync_ReturnsNullWhenUserDoesNotExist()
    {
        using var context = TestDbContextFactory.CreateContext();
        var service = CreateService(
            context,
            new PasswordHasher<ApplicationUser>(),
            new FakeTokenService()
        );

        var response = await service.LoginAsync(
            new LoginRequest
            {
                Username = "missing",
                Password = "password123"
            }
        );

        Assert.Null(response);
    }

    private static AuthService CreateService(
        backend.Data.ApplicationDbContext context,
        IPasswordHasher<ApplicationUser> passwordHasher,
        FakeTokenService tokenService)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Jwt:ExpiryMinutes"] = "120"
                }
            )
            .Build();

        return new AuthService(
            context,
            passwordHasher,
            tokenService,
            configuration
        );
    }
}