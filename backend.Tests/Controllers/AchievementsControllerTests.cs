using backend.Controllers;
using backend.DTOs.Achievements;
using backend.Services;
using backend.Tests.TestHelpers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Tests.Controllers;

public class AchievementsControllerTests
{
    [Fact]
    public async Task GetAll_ReturnsOkFromService()
    {
        var service = new FakeProgressService
        {
            AchievementsResponse =
            [
                new AchievementResponse
                {
                    Id = 1,
                    Name = "First Application",
                    IsUnlocked = true
                }
            ]
        };

        var controller = new AchievementsController(service)
        {
            ControllerContext = ControllerTestHelper.CreateControllerContext(1)
        };

        var result = await controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsAssignableFrom<IReadOnlyList<AchievementResponse>>(
            okResult.Value
        );

        Assert.Single(response);
        Assert.True(response[0].IsUnlocked);
        Assert.Equal(1, service.LastUserId);
    }

    [Fact]
    public async Task GetAll_ReturnsUnauthorizedWhenUserClaimIsInvalid()
    {
        var controller = new AchievementsController(new FakeProgressService())
        {
            ControllerContext = ControllerTestHelper.CreateControllerContext(null)
        };

        var result = await controller.GetAll();

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }
}