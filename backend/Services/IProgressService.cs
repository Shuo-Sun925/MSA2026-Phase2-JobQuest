using backend.DTOs.Achievements;
using backend.DTOs.JobApplications;
using backend.DTOs.Progress;

namespace backend.Services;

public interface IProgressService
{
    Task<ProgressResponse> GetProgressAsync(int userId);

    Task<ProgressSummaryResponse> GetProgressSummaryAsync(int userId);

    Task<WeeklyGoalProgressResponse> GetWeeklyGoalProgressAsync(int userId);

    Task<IReadOnlyList<AchievementResponse>> GetAchievementsAsync(int userId);
}