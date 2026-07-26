using backend.DTOs.Achievements;
using backend.DTOs.JobApplications;
using backend.DTOs.Progress;
using backend.Services;

namespace backend.Tests.TestHelpers;

internal sealed class FakeProgressService : IProgressService
{
    public int LastUserId { get; private set; }

    public ProgressResponse ProgressResponse { get; set; } = new();

    public ProgressSummaryResponse SummaryResponse { get; set; } = new();

    public WeeklyGoalProgressResponse WeeklyGoalProgressResponse
    {
        get;
        set;
    } = new();

    public IReadOnlyList<AchievementResponse> AchievementsResponse
    {
        get;
        set;
    } = [];

    public Task<ProgressResponse> GetProgressAsync(int userId)
    {
        LastUserId = userId;
        return Task.FromResult(ProgressResponse);
    }

    public Task<ProgressSummaryResponse> GetProgressSummaryAsync(int userId)
    {
        LastUserId = userId;
        return Task.FromResult(SummaryResponse);
    }

    public Task<WeeklyGoalProgressResponse> GetWeeklyGoalProgressAsync(int userId)
    {
        LastUserId = userId;
        return Task.FromResult(WeeklyGoalProgressResponse);
    }

    public Task<IReadOnlyList<AchievementResponse>> GetAchievementsAsync(int userId)
    {
        LastUserId = userId;
        return Task.FromResult(AchievementsResponse);
    }
}