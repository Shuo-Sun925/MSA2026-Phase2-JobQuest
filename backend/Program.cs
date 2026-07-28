using System.Text;
using System.Text.Json.Serialization;
using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "FrontendCors";

// -------------------------------------------------------
// Environment
// -------------------------------------------------------

var isTesting = builder.Environment.IsEnvironment("Testing");

// -------------------------------------------------------
// CORS configuration
// -------------------------------------------------------

string[] GetCorsAllowedOrigins(
    IConfiguration configuration,
    IWebHostEnvironment environment)
{
    var configuredOrigins = configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>()
        ?? [];

    // Supports environment-variable style values such as:
    // Cors__AllowedOrigins=http://localhost:5173
    //
    // Also supports comma-separated or semicolon-separated values.
    if (configuredOrigins.Length == 0)
    {
        var rawOrigins = configuration["Cors:AllowedOrigins"];

        if (!string.IsNullOrWhiteSpace(rawOrigins))
        {
            configuredOrigins = rawOrigins.Split(
                [',', ';'],
                StringSplitOptions.RemoveEmptyEntries
                | StringSplitOptions.TrimEntries
            );
        }
    }

    // Use the Vite development server by default during local development.
    if (configuredOrigins.Length == 0
        && environment.IsDevelopment())
    {
        configuredOrigins =
        [
            "http://localhost:5173"
        ];
    }

    return configuredOrigins
        .Where(origin =>
            Uri.TryCreate(
                origin,
                UriKind.Absolute,
                out var uri
            )
            && (
                uri.Scheme == Uri.UriSchemeHttp
                || uri.Scheme == Uri.UriSchemeHttps
            )
        )
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();
}

// -------------------------------------------------------
// Database configuration
// -------------------------------------------------------

var connectionString =
    builder.Configuration.GetConnectionString(
        "DefaultConnection"
    );

if (string.IsNullOrWhiteSpace(connectionString))
{
    if (!isTesting)
    {
        throw new InvalidOperationException(
            "Connection string 'DefaultConnection' was not configured."
        );
    }

    connectionString =
        "Host=localhost;"
        + "Database=jobquest_testing;"
        + "Username=test;"
        + "Password=test";
}

// -------------------------------------------------------
// JWT configuration
// -------------------------------------------------------

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    if (!isTesting)
    {
        throw new InvalidOperationException(
            "JWT key was not configured."
        );
    }

    jwtKey =
        "super-secret-test-key-123456789012345";
}

if (string.IsNullOrWhiteSpace(jwtIssuer))
{
    if (!isTesting)
    {
        throw new InvalidOperationException(
            "JWT issuer was not configured."
        );
    }

    jwtIssuer = "jobquest-tests";
}

if (string.IsNullOrWhiteSpace(jwtAudience))
{
    if (!isTesting)
    {
        throw new InvalidOperationException(
            "JWT audience was not configured."
        );
    }

    jwtAudience = "jobquest-tests";
}

// -------------------------------------------------------
// CORS allowed origins
// -------------------------------------------------------

var corsAllowedOrigins = GetCorsAllowedOrigins(
    builder.Configuration,
    builder.Environment
);

// -------------------------------------------------------
// Entity Framework Core and PostgreSQL
// -------------------------------------------------------

builder.Services.AddDbContext<ApplicationDbContext>(
    options =>
        options.UseNpgsql(connectionString)
);

// -------------------------------------------------------
// Controllers and JSON configuration
// -------------------------------------------------------

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter()
        );
    });

// -------------------------------------------------------
// CORS
// -------------------------------------------------------

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        FrontendCorsPolicy,
        policy =>
        {
            if (corsAllowedOrigins.Length == 0)
            {
                return;
            }

            policy
                .WithOrigins(corsAllowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    );
});

// -------------------------------------------------------
// Health checks
// -------------------------------------------------------

builder.Services.AddHealthChecks();

// -------------------------------------------------------
// OpenAPI and Scalar
// -------------------------------------------------------

builder.Services.AddOpenApi();

// -------------------------------------------------------
// Application services
// -------------------------------------------------------

builder.Services.AddScoped<
    IPasswordHasher<ApplicationUser>,
    PasswordHasher<ApplicationUser>
>();

builder.Services.AddScoped<
    ITokenService,
    TokenService
>();

builder.Services.AddScoped<
    IAuthService,
    AuthService
>();

builder.Services.AddScoped<
    IGamificationService,
    GamificationService
>();

builder.Services.AddScoped<
    IProgressService,
    ProgressService
>();

// -------------------------------------------------------
// Authentication and JWT bearer configuration
// -------------------------------------------------------

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,

                ValidateAudience = true,
                ValidAudience = jwtAudience,

                ValidateIssuerSigningKey = true,
                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)
                    ),

                ValidateLifetime = true,

                ClockSkew = TimeSpan.Zero
            };
    });

builder.Services.AddAuthorization();

// -------------------------------------------------------
// Build application
// -------------------------------------------------------

var app = builder.Build();

// -------------------------------------------------------
// OpenAPI and Scalar documentation
// -------------------------------------------------------

if (!app.Environment.IsEnvironment("Testing"))
{
    app.MapOpenApi();

    app.MapScalarApiReference(options =>
    {
        options.Title = "JobQuest API";
    });
}

// -------------------------------------------------------
// Middleware pipeline
// -------------------------------------------------------

if (!app.Environment.IsEnvironment("Testing"))
{
    app.UseHttpsRedirection();
}

// CORS must run before authentication and authorization.
if (corsAllowedOrigins.Length > 0)
{
    app.UseCors(FrontendCorsPolicy);
}

app.UseAuthentication();
app.UseAuthorization();

// -------------------------------------------------------
// Endpoints
// -------------------------------------------------------

app.MapHealthChecks("/health");

app.MapGet(
    "/",
    () => Results.Ok(
        new
        {
            message = "JobQuest API"
        }
    )
);

app.MapControllers();

app.Run();

// Required by integration tests using WebApplicationFactory<Program>.
public partial class Program
{
}