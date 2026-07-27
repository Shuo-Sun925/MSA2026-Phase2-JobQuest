using System.Text;
using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

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

if (app.Environment.IsDevelopment())
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

app.UseAuthentication();
app.UseAuthorization();

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