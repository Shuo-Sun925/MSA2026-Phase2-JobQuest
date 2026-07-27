using System.Net.Http.Json;
using backend.DTOs.JobApplications;
using backend.DTOs.Progress;
using backend.Models;

namespace backend.Tests.Integration;

public class ProgressSummaryIntegrationTests(
    TestWebApplicationFactory factory)
    : IntegrationTestBase(factory)
{
    [Fact]
    public async Task Summary_CountsWeeklyApplications_ByAppliedDateOnly()
    {
        var auth = await RegisterAsync("alice");
        SetBearerToken(Client, auth.Token);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var weekStart = today.AddDays(-(((int)today.DayOfWeek + 6) % 7));

        await Client.PostAsJsonAsync(
            "/api/jobapplications",
            new
            {
                CompanyName = "Saved Co",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Saved
            }
        );

        var appliedResponse = await Client.PostAsJsonAsync(
            "/api/jobapplications",
            new
            {
                CompanyName = "Applied Co",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Applied,
                AppliedDate = weekStart
            }
        );

        var applied = await ReadFromJsonAsync<JobApplicationResponse>(
            appliedResponse.Content
        );

        await Client.PutAsJsonAsync(
            $"/api/jobapplications/{applied!.Id}",
            new
            {
                CompanyName = "Applied Co",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Withdrawn,
                AppliedDate = weekStart
            }
        );

        await Client.PostAsJsonAsync(
            "/api/jobapplications",
            new
            {
                CompanyName = "Interview Co",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Interview,
                AppliedDate = weekStart.AddDays(1)
            }
        );

        using var bobClient = Factory.CreateClient();
        var bob = await RegisterWithClientAsync(bobClient, "bob");
        SetBearerToken(bobClient, bob.Token);

        await bobClient.PostAsJsonAsync(
            "/api/jobapplications",
            new
            {
                CompanyName = "Other User Co",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Applied,
                AppliedDate = weekStart.AddDays(2)
            }
        );

        var summaryResponse = await Client.GetAsync("/api/progress/summary");
        var summary = await ReadFromJsonAsync<ProgressSummaryResponse>(
            summaryResponse.Content
        );

        Assert.NotNull(summary);
        Assert.Equal(3, summary!.TotalApplications);
        Assert.Equal(2, summary.ApplicationsThisWeek);
        Assert.Equal(1, summary.SavedCount);
        Assert.Equal(1, summary.WithdrawnCount);
        Assert.Equal(1, summary.InterviewCount);
    }
}