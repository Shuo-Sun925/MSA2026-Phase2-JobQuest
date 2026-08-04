using System.Security.Claims;
using backend.DTOs.Achievements;
using backend.Helpers;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AchievementsController(
    IProgressService progressService)
    : ControllerBase
{
    private readonly IProgressService _progressService = progressService;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AchievementResponse>>> GetAll()
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var response = await _progressService.GetAchievementsAsync(userId);
        return Ok(response);
    }

    private bool TryGetCurrentUserId(out int userId)
    {
        return UserClaimsHelper.TryGetUserId(
            User,
            out userId
        );
    }
}