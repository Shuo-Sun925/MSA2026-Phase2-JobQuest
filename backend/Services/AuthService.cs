using backend.Data;
using backend.DTOs.Auth;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;

    private readonly IPasswordHasher<ApplicationUser>
        _passwordHasher;

    private readonly ITokenService _tokenService;

    private readonly IConfiguration _configuration;

    public AuthService(
        ApplicationDbContext context,
        IPasswordHasher<ApplicationUser> passwordHasher,
        ITokenService tokenService,
        IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(
        RegisterRequest request)
    {
        var username = request.Username.Trim();

        var normalizedUsername = username.ToLowerInvariant();

        var usernameAlreadyExists =
            await _context.Users.AnyAsync(user =>
                user.Username.ToLower() == normalizedUsername
            );

        if (usernameAlreadyExists)
        {
            throw new InvalidOperationException(
                "Username is already in use."
            );
        }

        var user = new ApplicationUser
        {
            Username = username,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash =
            _passwordHasher.HashPassword(
                user,
                request.Password
            );

        var progress = new UserProgress
        {
            User = user,
            TotalPoints = 0,
            CurrentLevel = 1,
            CurrentStreak = 0,
            LastActivityDate = null,
            WeeklyGoal = 5,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        _context.UserProgress.Add(progress);

        await _context.SaveChangesAsync();

        return CreateAuthResponse(user);
    }

    public async Task<AuthResponse?> LoginAsync(
        LoginRequest request)
    {
        var username = request.Username.Trim();

        var normalizedUsername =
            username.ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(existingUser =>
                existingUser.Username.ToLower()
                    == normalizedUsername
            );

        if (user is null)
        {
            return null;
        }

        var verificationResult =
            _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password
            );

        if (verificationResult
            == PasswordVerificationResult.Failed)
        {
            return null;
        }

        return CreateAuthResponse(user);
    }

    private AuthResponse CreateAuthResponse(
        ApplicationUser user)
    {
        var expiryMinutes =
            _configuration.GetValue<int?>(
                "Jwt:ExpiryMinutes"
            ) ?? 120;

        var expiresAt = DateTime.UtcNow.AddMinutes(
            expiryMinutes
        );

        var token = _tokenService.CreateToken(
            user,
            expiresAt
        );

        return new AuthResponse
        {
            UserId = user.Id,
            Username = user.Username,
            Token = token,
            ExpiresAt = expiresAt
        };
    }
}