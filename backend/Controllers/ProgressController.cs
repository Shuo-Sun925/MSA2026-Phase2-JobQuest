using System.Security.Claims;
using backend.DTOs.JobApplications;
using backend.DTOs.Progress;
using backend.Helpers;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProgressController(
    IProgressService progressService)
    : ControllerBase
{
    private readonly IProgressService _progressService = progressService;

    [HttpGet]
    public async Task<ActionResult<ProgressResponse>> GetProgress()
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var response = await _progressService.GetProgressAsync(userId);
        return Ok(response);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ProgressSummaryResponse>> GetSummary()
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var response = await _progressService.GetProgressSummaryAsync(userId);
        return Ok(response);
    }

    [HttpGet("weekly-goal-progress")]
    public async Task<ActionResult<WeeklyGoalProgressResponse>> GetWeeklyGoalProgress()
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var response = await _progressService.GetWeeklyGoalProgressAsync(userId);
        return Ok(response);
    }

    [HttpPatch("weekly-goal")]
    public async Task<ActionResult<ProgressResponse>> UpdateWeeklyGoal(
        UpdateWeeklyGoalRequest request)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var response = await _progressService.UpdateWeeklyGoalAsync(
            userId,
            request.WeeklyGoal
        );

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