using System.Data.Common;
using backend.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace backend.Tests.Integration;

public class TestWebApplicationFactory : WebApplicationFactory<Program>, IDisposable
{
    private const string TestJwtKey =
        "super-secret-test-key-123456789012345";

    private const string TestJwtIssuer =
        "jobquest-tests";

    private const string TestJwtAudience =
        "jobquest-tests";

    private readonly DbConnection _connection;

    public TestWebApplicationFactory()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        _connection.Open();
    }

    public async Task ResetDatabaseAsync()
    {
        await using var scope = Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await dbContext.Database.EnsureDeletedAsync();
        await dbContext.Database.EnsureCreatedAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, configurationBuilder) =>
        {
            configurationBuilder.AddInMemoryCollection(
            [
                new KeyValuePair<string, string?>(
                    "ConnectionStrings:DefaultConnection",
                    "Data Source=:memory:"
                ),
                new KeyValuePair<string, string?>(
                    "Jwt:Key",
                    TestJwtKey
                ),
                new KeyValuePair<string, string?>(
                    "Jwt:Issuer",
                    TestJwtIssuer
                ),
                new KeyValuePair<string, string?>(
                    "Jwt:Audience",
                    TestJwtAudience
                ),
                new KeyValuePair<string, string?>(
                    "Jwt:ExpiryMinutes",
                    "120"
                )
            ]);
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<ApplicationDbContext>();
            services.RemoveAll(typeof(DbContextOptions<ApplicationDbContext>));
            services.RemoveAll(typeof(IDbContextOptionsConfiguration<ApplicationDbContext>));
            services.RemoveAll<DbConnection>();

            services.AddSingleton(_connection);

            services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
            {
                options.UseSqlite(serviceProvider.GetRequiredService<DbConnection>());
            });

            services.PostConfigure<JwtBearerOptions>(
                JwtBearerDefaults.AuthenticationScheme,
                options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = TestJwtIssuer,
                        ValidateAudience = true,
                        ValidAudience = TestJwtAudience,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(TestJwtKey)
                        ),
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    };
                }
            );

            var serviceProvider = services.BuildServiceProvider();

            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            dbContext.Database.EnsureCreated();
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (disposing)
        {
            _connection.Dispose();
        }
    }
}