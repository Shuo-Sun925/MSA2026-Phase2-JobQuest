using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.DTOs.Auth;
using Microsoft.AspNetCore.Mvc.Testing;

namespace backend.Tests.Integration;

public abstract class IntegrationTestBase(
    TestWebApplicationFactory factory)
    : IClassFixture<TestWebApplicationFactory>, IAsyncLifetime
{
    protected TestWebApplicationFactory Factory { get; } = factory;

    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web)
        {
            Converters =
            {
                new JsonStringEnumConverter()
            }
        };

    protected HttpClient Client { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        await Factory.ResetDatabaseAsync();

        Client = Factory.CreateClient();
    }

    public Task DisposeAsync()
    {
        Client.Dispose();
        return Task.CompletedTask;
    }

    protected async Task<AuthResponse> RegisterAsync(
        string username,
        string password = "password123")
    {
        return await RegisterWithClientAsync(
            Client,
            username,
            password
        );
    }

    protected async Task<AuthResponse> LoginAsync(
        string username,
        string password = "password123")
    {
        var response = await Client.PostAsJsonAsync(
            "/api/auth/login",
            new
            {
                Username = username,
                Password = password
            }
        );

        response.EnsureSuccessStatusCode();

        return (await response.Content.ReadFromJsonAsync<AuthResponse>())!;
    }

    protected static void SetBearerToken(
        HttpClient client,
        string token)
    {
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    protected static async Task<AuthResponse> RegisterWithClientAsync(
        HttpClient client,
        string username,
        string password = "password123")
    {
        var response = await client.PostAsJsonAsync(
            "/api/auth/register",
            new
            {
                Username = username,
                Password = password
            }
        );

        response.EnsureSuccessStatusCode();

        return (await ReadFromJsonAsync<AuthResponse>(
            response.Content
        ))!;
    }

    protected static async Task<T?> ReadFromJsonAsync<T>(
        HttpContent content)
    {
        return await content.ReadFromJsonAsync<T>(
            JsonOptions
        );
    }
}