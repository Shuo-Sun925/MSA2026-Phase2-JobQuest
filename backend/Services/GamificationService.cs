using backend.Data;
using backend.Helpers;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class GamificationService(
    ApplicationDbContext context)
    : IGamificationService
{
    private readonly ApplicationDbContext _context = context;

    public async Task ApplyOnCreateAsync(
        JobApplication application)
    {
        var progress = await GetOrCreateProgressAsync(
            application.UserId
        );

        var awardedPoints =
            GamificationRules.ApplicationCreatedPoints
            + GamificationRules.GetCreateStatusPoints(
                application.Status
            );

        var unlockedFollowUpReward = TryAwardFollowUpPoints(
            application,
            ref awardedPoints
        );

        ApplyActivity(
            progress,
            awardedPoints,
            hasActivity: true
        );

        await UnlockCreateAchievementsAsync(
            application,
            progress
        );
    }

    public async Task ApplyOnUpdateAsync(
        JobApplication application,
        JobApplicationStatus previousStatus,
        DateOnly? previousFollowUpDate)
    {
        var statusChanged = previousStatus != application.Status;
        var awardedPoints = statusChanged
            ? GamificationRules.GetTransitionStatusPoints(
                previousStatus,
                application.Status
            )
            : 0;

        var unlockedFollowUpReward =
            previousFollowUpDate is null
            && TryAwardFollowUpPoints(
                application,
                ref awardedPoints
            );

        if (!statusChanged && !unlockedFollowUpReward)
        {
            return;
        }

        var progress = await GetOrCreateProgressAsync(
            application.UserId
        );

        ApplyActivity(
            progress,
            awardedPoints,
            hasActivity: statusChanged || unlockedFollowUpReward
        );

        await UnlockUpdateAchievementsAsync(
            application,
            progress
        );
    }

    private async Task<UserProgress> GetOrCreateProgressAsync(
        int userId)
    {
        var progress = await _context.UserProgress
            .FirstOrDefaultAsync(progress =>
                progress.UserId == userId
            );

        if (progress is not null)
        {
            return progress;
        }

        progress = new UserProgress
        {
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.UserProgress.Add(progress);

        return progress;
    }

    private static bool TryAwardFollowUpPoints(
        JobApplication application,
        ref int awardedPoints)
    {
        if (application.HasEarnedFollowUpPoints
            || !application.NextFollowUpDate.HasValue)
        {
            return false;
        }

        application.HasEarnedFollowUpPoints = true;
        awardedPoints +=
            GamificationRules.FollowUpAddedPoints;

        return true;
    }

    private static void ApplyActivity(
        UserProgress progress,
        int awardedPoints,
        bool hasActivity)
    {
        if (!hasActivity && awardedPoints == 0)
        {
            return;
        }

        progress.TotalPoints += awardedPoints;
        progress.CurrentLevel =
            GamificationRules.GetLevelForPoints(
                progress.TotalPoints
            );

        if (hasActivity)
        {
            UpdateStreak(progress);
        }

        progress.UpdatedAt = DateTime.UtcNow;
    }

    private static void UpdateStreak(
        UserProgress progress)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (progress.LastActivityDate == today)
        {
            return;
        }

        progress.CurrentStreak =
            progress.LastActivityDate == today.AddDays(-1)
                ? progress.CurrentStreak + 1
                : 1;

        progress.LastActivityDate = today;
    }

    private async Task UnlockCreateAchievementsAsync(
        JobApplication application,
        UserProgress progress)
    {
        var applicationCount = await _context.JobApplications
            .CountAsync(existingApplication =>
                existingApplication.UserId == application.UserId
            ) + 1;

        if (applicationCount >= 1)
        {
            UnlockAchievement(
                application.UserId,
                AchievementCatalog.FirstApplicationId
            );
        }

        if (applicationCount >= 5)
        {
            UnlockAchievement(
                application.UserId,
                AchievementCatalog.JobHunterId
            );
        }

        UnlockStreakAchievement(
            application.UserId,
            progress
        );

        UnlockStatusAchievements(
            application.UserId,
            application.Status
        );
    }

    private async Task UnlockUpdateAchievementsAsync(
        JobApplication application,
        UserProgress progress)
    {
        UnlockStreakAchievement(
            application.UserId,
            progress
        );

        UnlockStatusAchievements(
            application.UserId,
            application.Status
        );

        await Task.CompletedTask;
    }

    private void UnlockStreakAchievement(
        int userId,
        UserProgress progress)
    {
        if (progress.CurrentStreak >= 3)
        {
            UnlockAchievement(
                userId,
                AchievementCatalog.ConsistentSeekerId
            );
        }
    }

    private void UnlockStatusAchievements(
        int userId,
        JobApplicationStatus status)
    {
        if (GamificationRules.HasReachedInterview(status))
        {
            UnlockAchievement(
                userId,
                AchievementCatalog.InterviewUnlockedId
            );
        }

        if (GamificationRules.HasReachedOffer(status))
        {
            UnlockAchievement(
                userId,
                AchievementCatalog.OfferHunterId
            );
        }
    }

    private void UnlockAchievement(
        int userId,
        int achievementId)
    {
        var alreadyUnlocked = _context.UserAchievements
            .Local
            .Any(userAchievement =>
                userAchievement.UserId == userId
                && userAchievement.AchievementId
                    == achievementId
            )
            || _context.UserAchievements.Any(
                userAchievement =>
                    userAchievement.UserId == userId
                    && userAchievement.AchievementId
                        == achievementId
            );

        if (alreadyUnlocked)
        {
            return;
        }

        _context.UserAchievements.Add(
            new UserAchievement
            {
                UserId = userId,
                AchievementId = achievementId,
                UnlockedAt = DateTime.UtcNow
            }
        );
    }
}