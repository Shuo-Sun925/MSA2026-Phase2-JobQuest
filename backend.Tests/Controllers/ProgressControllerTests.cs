using backend.Controllers;
using backend.DTOs.JobApplications;
using backend.DTOs.Progress;
using backend.Models;
using backend.Services;
using backend.Tests.TestHelpers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Tests.Controllers;

public class ProgressControllerTests
{
    [Fact]
    public async Task GetProgress_ReturnsUnauthorizedWhenUserClaimIsInvalid()
    {
        var controller = new ProgressController(new FakeProgressService())
        {
            ControllerContext = ControllerTestHelper.CreateControllerContext(null)
        };

        var result = await controller.GetProgress();

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetProgress_ReturnsOkFromService()
    {
        var service = new FakeProgressService
        {
            ProgressResponse = new ProgressResponse
            {
                TotalPoints = 100,
                CurrentLevel = 3,
                CurrentStreak = 2,
                WeeklyGoal = 5
            }
        };

        var controller = new ProgressController(service)
        {
            ControllerContext = ControllerTestHelper.CreateControllerContext(1)
        };

        var result = await controller.GetProgress();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ProgressResponse>(okResult.Value);

        Assert.Equal(1, service.LastUserId);
        Assert.Equal(100, response.TotalPoints);
    }

    [Fact]
    public async Task GetSummary_ReturnsOkFromService()
    {
        var service = new FakeProgressService
        {
            SummaryResponse = new ProgressSummaryResponse
            {
                TotalApplications = 7,
                WeeklyGoalProgress = 4,
                IsGoalMet = true
            }
        };

        var controller = new ProgressController(service)
        {
            ControllerContext = ControllerTestHelper.CreateControllerContext(1)
        };

        var result = await controller.GetSummary();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ProgressSummaryResponse>(okResult.Value);

        Assert.Equal(7, response.TotalApplications);
        Assert.True(response.IsGoalMet);
    }

    [Fact]
    public async Task GetWeeklyGoalProgress_ReturnsOkFromService()
    {
        var service = new FakeProgressService
        {
            WeeklyGoalProgressResponse = new WeeklyGoalProgressResponse
            {
                WeeklyGoal = 5,
                AppliedThisWeek = 3,
                RemainingApplications = 2,
                IsGoalMet = false
            }
        };

        var controller = new ProgressController(service)
        {
            ControllerContext = ControllerTestHelper.CreateControllerContext(1)
        };

        var result = await controller.GetWeeklyGoalProgress();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<WeeklyGoalProgressResponse>(okResult.Value);

        Assert.Equal(3, response.AppliedThisWeek);
        Assert.False(response.IsGoalMet);
    }
}