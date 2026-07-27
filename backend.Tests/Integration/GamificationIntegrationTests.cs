using System.Net;
using System.Net.Http.Json;
using backend.DTOs.Achievements;
using backend.DTOs.JobApplications;
using backend.DTOs.Progress;
using backend.Models;

namespace backend.Tests.Integration;

public class GamificationIntegrationTests(
    TestWebApplicationFactory factory)
    : IntegrationTestBase(factory)
{
    [Fact]
    public async Task AppliedToInterview_UpdatesProgressAndAchievements()
    {
        var auth = await RegisterAsync("alice");
        SetBearerToken(Client, auth.Token);

        var createResponse = await Client.PostAsJsonAsync(
            "/api/jobapplications",
            new
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Applied
            }
        );

        var created = await ReadFromJsonAsync<JobApplicationResponse>(
            createResponse.Content
        );

        var updateResponse = await Client.PutAsJsonAsync(
            $"/api/jobapplications/{created!.Id}",
            new
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Interview
            }
        );

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var progressResponse = await Client.GetAsync("/api/progress");
        var progress = await ReadFromJsonAsync<ProgressResponse>(
            progressResponse.Content
        );

        Assert.NotNull(progress);
        Assert.Equal(65, progress!.TotalPoints);
        Assert.Equal(2, progress.CurrentLevel);

        var achievementsResponse = await Client.GetAsync("/api/achievements");
        var achievements = await ReadFromJsonAsync<List<AchievementResponse>>(
            achievementsResponse.Content
        );

        Assert.NotNull(achievements);
        Assert.True(
            achievements!.Single(item => item.Name == "First Application").IsUnlocked
        );
        Assert.True(
            achievements.Single(item => item.Name == "Interview Unlocked").IsUnlocked
        );
    }
}