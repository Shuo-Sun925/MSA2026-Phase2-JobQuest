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

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal(
            "You can't move an application from Offer to Interview.",
            badRequestResult.Value?.GetType().GetProperty("message")?.GetValue(badRequestResult.Value)
        );
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