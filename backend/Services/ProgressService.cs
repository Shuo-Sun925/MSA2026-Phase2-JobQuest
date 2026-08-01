using backend.Data;
using backend.DTOs.Achievements;
using backend.DTOs.JobApplications;
using backend.DTOs.Progress;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ProgressService(
    ApplicationDbContext context)
    : IProgressService
{
    private const int DefaultWeeklyGoal = 5;
    private const int MinimumWeeklyGoal = 1;
    private const int MaximumWeeklyGoal = 20;

    private readonly ApplicationDbContext _context = context;

    public async Task<ProgressResponse> GetProgressAsync(int userId)
    {
        var progress = await _context.UserProgress
            .AsNoTracking()
            .FirstOrDefaultAsync(progress =>
                progress.UserId == userId
            );

        if (progress is null)
        {
            return CreateDefaultProgressResponse();
        }

        return MapToProgressResponse(progress);
    }

    public async Task<ProgressSummaryResponse> GetProgressSummaryAsync(int userId)
    {
        var progress = await GetProgressAsync(userId);
        var weeklyGoalProgress = await GetWeeklyGoalProgressAsync(userId);

        var applications = await _context.JobApplications
            .AsNoTracking()
            .Where(application => application.UserId == userId)
            .ToListAsync();

        return new ProgressSummaryResponse
        {
            TotalApplications = applications.Count,
            ApplicationsThisWeek = weeklyGoalProgress.AppliedThisWeek,
            SavedCount = CountByStatus(applications, JobApplicationStatus.Saved),
            AppliedCount = CountByStatus(applications, JobApplicationStatus.Applied),
            OnlineAssessmentCount = CountByStatus(applications, JobApplicationStatus.OnlineAssessment),
            InterviewCount = CountByStatus(applications, JobApplicationStatus.Interview),
            OfferCount = CountByStatus(applications, JobApplicationStatus.Offer),
            RejectedCount = CountByStatus(applications, JobApplicationStatus.Rejected),
            WithdrawnCount = CountByStatus(applications, JobApplicationStatus.Withdrawn),
            TotalPoints = progress.TotalPoints,
            CurrentLevel = progress.CurrentLevel,
            CurrentStreak = progress.CurrentStreak,
            LastActivityDate = progress.LastActivityDate,
            WeeklyGoal = progress.WeeklyGoal,
            WeeklyGoalProgress = weeklyGoalProgress.AppliedThisWeek,
            RemainingApplications = weeklyGoalProgress.RemainingApplications,
            IsGoalMet = weeklyGoalProgress.IsGoalMet
        };
    }

    public async Task<WeeklyGoalProgressResponse> GetWeeklyGoalProgressAsync(int userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var weekStartDate = GetWeekStart(today);
        var nextWeekStartDate = weekStartDate.AddDays(7);

        var weeklyGoal = await _context.UserProgress
            .AsNoTracking()
            .Where(progress => progress.UserId == userId)
            .Select(progress => progress.WeeklyGoal)
            .FirstOrDefaultAsync();

        weeklyGoal = NormalizeWeeklyGoal(weeklyGoal);

        var appliedThisWeek = await _context.JobApplications
            .AsNoTracking()
            .CountAsync(application =>
                application.UserId == userId
                && application.AppliedDate.HasValue
                && application.AppliedDate.Value >= weekStartDate
                && application.AppliedDate.Value < nextWeekStartDate
            );

        return new WeeklyGoalProgressResponse
        {
            WeeklyGoal = weeklyGoal,
            AppliedThisWeek = appliedThisWeek,
            RemainingApplications = Math.Max(weeklyGoal - appliedThisWeek, 0),
            IsGoalMet = appliedThisWeek >= weeklyGoal,
            WeekStartDate = weekStartDate,
            WeekEndDate = nextWeekStartDate.AddDays(-1)
        };
    }

    public async Task<ProgressResponse> UpdateWeeklyGoalAsync(
        int userId,
        int weeklyGoal)
    {
        if (weeklyGoal < MinimumWeeklyGoal
            || weeklyGoal > MaximumWeeklyGoal)
        {
            throw new ArgumentOutOfRangeException(
                nameof(weeklyGoal),
                $"Weekly goal must be between {MinimumWeeklyGoal} and {MaximumWeeklyGoal}."
            );
        }

        var progress = await GetOrCreateProgressAsync(userId);

        progress.WeeklyGoal = weeklyGoal;
        progress.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToProgressResponse(progress);
    }

    public async Task<IReadOnlyList<AchievementResponse>> GetAchievementsAsync(int userId)
    {
        var achievements = await _context.Achievements
            .AsNoTracking()
            .OrderBy(achievement => achievement.Id)
            .ToListAsync();

        var unlockedAchievements = await _context.UserAchievements
            .AsNoTracking()
            .Where(userAchievement => userAchievement.UserId == userId)
            .ToDictionaryAsync(
                userAchievement => userAchievement.AchievementId,
                userAchievement => userAchievement.UnlockedAt
            );

        return achievements
            .Select(achievement =>
            {
                var isUnlocked = unlockedAchievements.TryGetValue(
                    achievement.Id,
                    out var unlockedAt
                );

                return new AchievementResponse
                {
                    Id = achievement.Id,
                    Name = achievement.Name,
                    Description = achievement.Description,
                    Icon = achievement.Icon,
                    ConditionType = achievement.ConditionType,
                    TargetValue = achievement.TargetValue,
                    IsUnlocked = isUnlocked,
                    UnlockedAt = isUnlocked ? unlockedAt : null
                };
            })
            .ToList();
    }

    private static ProgressResponse CreateDefaultProgressResponse()
    {
        return new ProgressResponse
        {
            TotalPoints = 0,
            CurrentLevel = 1,
            CurrentStreak = 0,
            LastActivityDate = null,
            WeeklyGoal = DefaultWeeklyGoal
        };
    }

    private static ProgressResponse MapToProgressResponse(
        UserProgress progress)
    {
        return new ProgressResponse
        {
            TotalPoints = progress.TotalPoints,
            CurrentLevel = progress.CurrentLevel,
            CurrentStreak = progress.CurrentStreak,
            LastActivityDate = progress.LastActivityDate,
            WeeklyGoal = NormalizeWeeklyGoal(progress.WeeklyGoal)
        };
    }

    private static int NormalizeWeeklyGoal(int weeklyGoal)
    {
        return weeklyGoal > 0 ? weeklyGoal : DefaultWeeklyGoal;
    }

    private async Task<UserProgress> GetOrCreateProgressAsync(int userId)
    {
        var progress = await _context.UserProgress
            .FirstOrDefaultAsync(existingProgress =>
                existingProgress.UserId == userId
            );

        if (progress is not null)
        {
            return progress;
        }

        progress = new UserProgress
        {
            UserId = userId,
            TotalPoints = 0,
            CurrentLevel = 1,
            CurrentStreak = 0,
            LastActivityDate = null,
            WeeklyGoal = DefaultWeeklyGoal,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.UserProgress.Add(progress);

        return progress;
    }

    private static int CountByStatus(
        IEnumerable<JobApplication> applications,
        JobApplicationStatus status)
    {
        return applications.Count(application => application.Status == status);
    }

    private static DateOnly GetWeekStart(DateOnly date)
    {
        var offset = ((int)date.DayOfWeek + 6) % 7;
        return date.AddDays(-offset);
    }
}