using System.Net;
using System.Net.Http.Json;
using backend.DTOs.Progress;

namespace backend.Tests.Integration;

public class ProgressWeeklyGoalIntegrationTests(
    TestWebApplicationFactory factory)
    : IntegrationTestBase(factory)
{
    [Fact]
    public async Task UpdateWeeklyGoal_AllowsAuthenticatedUserToChangeOwnGoal()
    {
        var auth = await RegisterAsync("alice");
        SetBearerToken(Client, auth.Token);

        var patchResponse = await Client.PatchAsJsonAsync(
            "/api/progress/weekly-goal",
            new
            {
                WeeklyGoal = 7
            }
        );

        Assert.Equal(HttpStatusCode.OK, patchResponse.StatusCode);

        var updatedProgress = await ReadFromJsonAsync<ProgressResponse>(
            patchResponse.Content
        );

        Assert.NotNull(updatedProgress);
        Assert.Equal(7, updatedProgress!.WeeklyGoal);

        var progressResponse = await Client.GetAsync("/api/progress");
        var progress = await ReadFromJsonAsync<ProgressResponse>(
            progressResponse.Content
        );

        Assert.NotNull(progress);
        Assert.Equal(7, progress!.WeeklyGoal);
    }

    [Fact]
    public async Task UpdateWeeklyGoal_ReturnsBadRequestWhenGoalIsLessThanOne()
    {
        var auth = await RegisterAsync("alice");
        SetBearerToken(Client, auth.Token);

        var response = await Client.PatchAsJsonAsync(
            "/api/progress/weekly-goal",
            new
            {
                WeeklyGoal = 0
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateWeeklyGoal_ReturnsBadRequestWhenGoalIsGreaterThanTwenty()
    {
        var auth = await RegisterAsync("alice");
        SetBearerToken(Client, auth.Token);

        var response = await Client.PatchAsJsonAsync(
            "/api/progress/weekly-goal",
            new
            {
                WeeklyGoal = 21
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateWeeklyGoal_ReturnsUnauthorizedWithoutAuthentication()
    {
        var response = await Client.PatchAsJsonAsync(
            "/api/progress/weekly-goal",
            new
            {
                WeeklyGoal = 7
            }
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateWeeklyGoal_DoesNotAffectOtherUsers()
    {
        var alice = await RegisterAsync("alice");
        SetBearerToken(Client, alice.Token);

        using var bobClient = Factory.CreateClient();
        var bob = await RegisterWithClientAsync(bobClient, "bob");
        SetBearerToken(bobClient, bob.Token);

        await Client.PatchAsJsonAsync(
            "/api/progress/weekly-goal",
            new
            {
                WeeklyGoal = 10
            }
        );

        var aliceProgressResponse = await Client.GetAsync("/api/progress");
        var aliceProgress = await ReadFromJsonAsync<ProgressResponse>(
            aliceProgressResponse.Content
        );

        var bobProgressResponse = await bobClient.GetAsync("/api/progress");
        var bobProgress = await ReadFromJsonAsync<ProgressResponse>(
            bobProgressResponse.Content
        );

        Assert.NotNull(aliceProgress);
        Assert.NotNull(bobProgress);
        Assert.Equal(10, aliceProgress!.WeeklyGoal);
        Assert.Equal(5, bobProgress!.WeeklyGoal);
    }
}