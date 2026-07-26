using backend.Controllers;
using backend.DTOs.JobApplications;
using backend.Models;
using backend.Tests.TestHelpers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Tests.Controllers;

public class JobApplicationsControllerTests
{
    [Fact]
    public async Task GetAll_ReturnsOnlyCurrentUsersApplications()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.JobApplications.AddRange(
            new JobApplication
            {
                Id = 1,
                UserId = 1,
                CompanyName = "Contoso",
                JobTitle = "Engineer"
            },
            new JobApplication
            {
                Id = 2,
                UserId = 2,
                CompanyName = "Fabrikam",
                JobTitle = "Analyst"
            }
        );
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);

        var result = await controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var responses = Assert.IsAssignableFrom<IEnumerable<JobApplicationResponse>>(
            okResult.Value
        );

        Assert.Single(responses);
        Assert.Equal("Contoso", responses.Single().CompanyName);
    }

    [Fact]
    public async Task GetById_ReturnsNotFoundForOtherUsersApplication()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.JobApplications.Add(
            new JobApplication
            {
                Id = 1,
                UserId = 2,
                CompanyName = "Fabrikam",
                JobTitle = "Analyst"
            }
        );
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);

        var result = await controller.GetById(1);

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_ResolvesAppliedDateAndCallsGamification()
    {
        using var context = TestDbContextFactory.CreateContext();
        var gamificationService = new FakeGamificationService();
        var controller = CreateController(context, 1, gamificationService);

        var result = await controller.Create(
            new CreateJobApplicationRequest
            {
                CompanyName = " Contoso ",
                JobTitle = " Engineer ",
                Status = JobApplicationStatus.Applied
            }
        );

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var response = Assert.IsType<JobApplicationResponse>(createdResult.Value);

        Assert.Equal(JobApplicationStatus.Applied, response.Status);
        Assert.Equal(DateOnly.FromDateTime(DateTime.UtcNow), response.AppliedDate);
        Assert.Equal(1, gamificationService.CreateCalls);
        Assert.Equal("Contoso", context.JobApplications.Single().CompanyName);
        Assert.Equal("Engineer", context.JobApplications.Single().JobTitle);
    }

    [Fact]
    public async Task Update_ReturnsBadRequestForInvalidStatusTransition()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.JobApplications.Add(
            new JobApplication
            {
                Id = 1,
                UserId = 1,
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Offer
            }
        );
        await context.SaveChangesAsync();

        var gamificationService = new FakeGamificationService();
        var controller = CreateController(context, 1, gamificationService);

        var result = await controller.Update(
            1,
            new UpdateJobApplicationRequest
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Interview
            }
        );

        Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal(0, gamificationService.UpdateCalls);
    }

    [Fact]
    public async Task Update_PreservesAppliedDateForAppliedToWithdrawn()
    {
        using var context = TestDbContextFactory.CreateContext();
        var appliedDate = new DateOnly(2026, 7, 10);
        context.JobApplications.Add(
            new JobApplication
            {
                Id = 1,
                UserId = 1,
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Applied,
                AppliedDate = appliedDate,
                NextFollowUpDate = new DateOnly(2026, 7, 15)
            }
        );
        await context.SaveChangesAsync();

        var gamificationService = new FakeGamificationService();
        var controller = CreateController(context, 1, gamificationService);

        var result = await controller.Update(
            1,
            new UpdateJobApplicationRequest
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Withdrawn
            }
        );

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<JobApplicationResponse>(okResult.Value);

        Assert.Equal(appliedDate, response.AppliedDate);
        Assert.Null(response.NextFollowUpDate);
        Assert.Equal(1, gamificationService.UpdateCalls);
    }

    [Fact]
    public async Task Delete_RemovesOwnedApplication()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.JobApplications.Add(
            new JobApplication
            {
                Id = 1,
                UserId = 1,
                CompanyName = "Contoso",
                JobTitle = "Engineer"
            }
        );
        await context.SaveChangesAsync();

        var controller = CreateController(context, 1);

        var result = await controller.Delete(1);

        Assert.IsType<NoContentResult>(result);
        Assert.Empty(context.JobApplications);
    }

    [Fact]
    public async Task GetWeeklyGoalProgress_CountsApplicationsByAppliedDateOnlyForCurrentWeek()
    {
        using var context = TestDbContextFactory.CreateContext();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var weekStart = today.AddDays(-(((int)today.DayOfWeek + 6) % 7));

        context.UserProgress.Add(
            new UserProgress
            {
                UserId = 1,
                WeeklyGoal = 3
            }
        );

        context.JobApplications.AddRange(
            new JobApplication
            {
                UserId = 1,
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Applied,
                AppliedDate = weekStart
            },
            new JobApplication
            {
                UserId = 1,
                CompanyName = "Litware",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Withdrawn,
                AppliedDate = weekStart.AddDays(1)
            },
            new JobApplication
            {
                UserId = 1,
                CompanyName = "Tailspin",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Saved,
                AppliedDate = null
            },
            new JobApplication
            {
                UserId = 1,
                CompanyName = "Northwind",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Applied,
                AppliedDate = weekStart.AddDays(-1)
            },
            new JobApplication
            {
                UserId = 2,
                CompanyName = "Fabrikam",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Applied,
                AppliedDate = weekStart
            }
        );
        await context.SaveChangesAsync();

        var controller = CreateController(context, 1);

        var result = await controller.GetWeeklyGoalProgress();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<WeeklyGoalProgressResponse>(okResult.Value);

        Assert.Equal(3, response.WeeklyGoal);
        Assert.Equal(2, response.AppliedThisWeek);
        Assert.Equal(1, response.RemainingApplications);
        Assert.False(response.IsGoalMet);
        Assert.Equal(weekStart, response.WeekStartDate);
    }

    private static JobApplicationsController CreateController(
        backend.Data.ApplicationDbContext context,
        int userId,
        FakeGamificationService? gamificationService = null)
    {
        return new JobApplicationsController(
            context,
            gamificationService ?? new FakeGamificationService()
        )
        {
            ControllerContext = ControllerTestHelper.CreateControllerContext(userId)
        };
    }
}