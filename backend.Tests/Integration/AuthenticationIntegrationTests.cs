using System.Net;
using System.Net.Http.Json;
using backend.DTOs.Auth;

namespace backend.Tests.Integration;

public class AuthenticationIntegrationTests(
    TestWebApplicationFactory factory)
    : IntegrationTestBase(factory)
{
    [Fact]
    public async Task Register_ReturnsCreatedAndToken()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/auth/register",
            new
            {
                Username = "alice",
                Password = "password123"
            }
        );

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var body = await ReadFromJsonAsync<AuthResponse>(
            response.Content
        );

        Assert.NotNull(body);
        Assert.Equal("alice", body!.Username);
        Assert.False(string.IsNullOrWhiteSpace(body.Token));
    }

    [Fact]
    public async Task Register_ReturnsConflictForDuplicateUsername()
    {
        await RegisterAsync("alice");

        var response = await Client.PostAsJsonAsync(
            "/api/auth/register",
            new
            {
                Username = "alice",
                Password = "password123"
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Login_ReturnsOkForValidPassword()
    {
        await RegisterAsync("alice");

        var response = await Client.PostAsJsonAsync(
            "/api/auth/login",
            new
            {
                Username = "alice",
                Password = "password123"
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await ReadFromJsonAsync<AuthResponse>(
            response.Content
        );

        Assert.NotNull(body);
        Assert.False(string.IsNullOrWhiteSpace(body!.Token));
    }

    [Fact]
    public async Task Login_ReturnsUnauthorizedForWrongPassword()
    {
        await RegisterAsync("alice");

        var response = await Client.PostAsJsonAsync(
            "/api/auth/login",
            new
            {
                Username = "alice",
                Password = "wrong-password"
            }
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_ReturnsUnauthorizedWithoutToken()
    {
        var response = await Client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}