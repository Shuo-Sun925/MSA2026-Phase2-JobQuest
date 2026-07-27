using System.Text;
using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

string[] GetCorsAllowedOrigins(
    IConfiguration configuration)
{
    var configuredOrigins = configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>()
        ?? Array.Empty<string>();

    if (configuredOrigins.Length == 0)
    {
        var rawOrigins = configuration["Cors:AllowedOrigins"];

        if (!string.IsNullOrWhiteSpace(rawOrigins))
        {
            configuredOrigins = rawOrigins
                .Split(
                    [',', ';'],
                    StringSplitOptions.RemoveEmptyEntries
                    | StringSplitOptions.TrimEntries
                );
        }
    }

    return configuredOrigins
        .Where(origin =>
            Uri.TryCreate(
                origin,
                UriKind.Absolute,
                out _
            )
        )
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();
}

var isTesting = builder.Environment.IsEnvironment("Testing");

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
        "Host=localhost;Database=jobquest_testing;Username=test;Password=test";
}

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var corsAllowedOrigins = GetCorsAllowedOrigins(
    builder.Configuration
);

if (string.IsNullOrWhiteSpace(jwtKey))
{
    if (!isTesting)
    {
        throw new InvalidOperationException(
            "JWT key was not configured."
        );
    }

    jwtKey = "super-secret-test-key-123456789012345";
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

builder.Services.AddDbContext<ApplicationDbContext>(
    options =>
        options.UseNpgsql(connectionString)
);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter()
        );
    });

if (corsAllowedOrigins.Length > 0)
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(
            "FrontendCors",
            policy =>
            {
                policy
                    .WithOrigins(corsAllowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            }
        );
    });
}

builder.Services.AddHealthChecks();

builder.Services.AddOpenApi();

builder.Services.AddScoped<
    IPasswordHasher<ApplicationUser>,
    PasswordHasher<ApplicationUser>
>();

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<
    IGamificationService,
    GamificationService
>();
builder.Services.AddScoped<IProgressService, ProgressService>();

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer();

builder.Services
    .AddOptions<JwtBearerOptions>(
        JwtBearerDefaults.AuthenticationScheme
    )
    .Configure<IConfiguration>(
        (options, configuration) =>
        {
            var configuredJwtKey =
                configuration["Jwt:Key"];

            var configuredJwtIssuer =
                configuration["Jwt:Issuer"];

            var configuredJwtAudience =
                configuration["Jwt:Audience"];

            if (string.IsNullOrWhiteSpace(
                    configuredJwtKey
                ))
            {
                throw new InvalidOperationException(
                    "JWT key was not configured."
                );
            }

            if (string.IsNullOrWhiteSpace(
                    configuredJwtIssuer
                ))
            {
                throw new InvalidOperationException(
                    "JWT issuer was not configured."
                );
            }

            if (string.IsNullOrWhiteSpace(
                    configuredJwtAudience
                ))
            {
                throw new InvalidOperationException(
                    "JWT audience was not configured."
                );
            }

            options.TokenValidationParameters =
                new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = configuredJwtIssuer,

                    ValidateAudience = true,
                    ValidAudience = configuredJwtAudience,

                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey =
                        new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(
                                configuredJwtKey
                            )
                        ),

                    ValidateLifetime = true,

                    ClockSkew = TimeSpan.Zero
                };
        }
    );

builder.Services.AddAuthorization();

var app = builder.Build();

if (!app.Environment.IsEnvironment("Testing"))
{
    app.MapOpenApi();

    app.MapScalarApiReference(options =>
    {
        options.Title = "JobQuest API";
    });
}

if (!app.Environment.IsEnvironment("Testing"))
{
    app.UseHttpsRedirection();
}

if (corsAllowedOrigins.Length > 0)
{
    app.UseCors("FrontendCors");
}

app.UseAuthentication();
app.UseAuthorization();

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

public partial class Program
{
}