using backend.Helpers;
using backend.Models;
using backend.Services;
using backend.Tests.TestHelpers;

namespace backend.Tests.Services;

public class GamificationServiceTests
{
    [Fact]
    public async Task ApplyOnCreateAsync_AwardsCumulativePointsForDirectInterviewCreation()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.UserProgress.Add(
            new UserProgress
            {
                UserId = 1,
                TotalPoints = 0,
                CurrentLevel = 1
            }
        );
        await context.SaveChangesAsync();

        var service = new GamificationService(context);
        var application = new JobApplication
        {
            UserId = 1,
            Status = JobApplicationStatus.Interview
        };

        await service.ApplyOnCreateAsync(application);
        await context.SaveChangesAsync();

        var progress = Assert.Single(context.UserProgress);
        var unlockedIds = context.UserAchievements
            .Select(userAchievement => userAchievement.AchievementId)
            .ToList();

        Assert.Equal(65, progress.TotalPoints);
        Assert.Equal(2, progress.CurrentLevel);
        Assert.Equal(1, progress.CurrentStreak);
        Assert.Contains(AchievementCatalog.FirstApplicationId, unlockedIds);
        Assert.Contains(AchievementCatalog.InterviewUnlockedId, unlockedIds);
    }

    [Fact]
    public async Task ApplyOnCreateAsync_AwardsFollowUpPointsOnlyOnce()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.UserProgress.Add(
            new UserProgress
            {
                UserId = 1
            }
        );
        await context.SaveChangesAsync();

        var service = new GamificationService(context);
        var application = new JobApplication
        {
            UserId = 1,
            Status = JobApplicationStatus.Saved,
            NextFollowUpDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(2)
        };

        await service.ApplyOnCreateAsync(application);
        await context.SaveChangesAsync();

        var progress = Assert.Single(context.UserProgress);

        Assert.True(application.HasEarnedFollowUpPoints);
        Assert.Equal(15, progress.TotalPoints);
    }

    [Fact]
    public async Task ApplyOnUpdateAsync_AwardsSkippedStagesAndOfferAchievement()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.UserProgress.Add(
            new UserProgress
            {
                UserId = 1,
                TotalPoints = 10,
                CurrentLevel = 1
            }
        );
        await context.SaveChangesAsync();

        var service = new GamificationService(context);
        var application = new JobApplication
        {
            UserId = 1,
            Status = JobApplicationStatus.Offer
        };

        await service.ApplyOnUpdateAsync(
            application,
            previousStatus: JobApplicationStatus.Applied,
            previousFollowUpDate: null
        );
        await context.SaveChangesAsync();

        var progress = Assert.Single(context.UserProgress);
        var unlockedIds = context.UserAchievements
            .Select(userAchievement => userAchievement.AchievementId)
            .ToList();

        Assert.Equal(155, progress.TotalPoints);
        Assert.Equal(3, progress.CurrentLevel);
        Assert.Contains(AchievementCatalog.InterviewUnlockedId, unlockedIds);
        Assert.Contains(AchievementCatalog.OfferHunterId, unlockedIds);
    }

    [Fact]
    public async Task ApplyOnUpdateAsync_DoesNotAwardDuplicatePointsForSameStatusEdit()
    {
        using var context = TestDbContextFactory.CreateContext();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        context.UserProgress.Add(
            new UserProgress
            {
                UserId = 1,
                TotalPoints = 100,
                CurrentLevel = 3,
                CurrentStreak = 2,
                LastActivityDate = today
            }
        );
        await context.SaveChangesAsync();

        var service = new GamificationService(context);
        var application = new JobApplication
        {
            UserId = 1,
            Status = JobApplicationStatus.Applied
        };

        await service.ApplyOnUpdateAsync(
            application,
            previousStatus: JobApplicationStatus.Applied,
            previousFollowUpDate: null
        );
        await context.SaveChangesAsync();

        var progress = Assert.Single(context.UserProgress);

        Assert.Equal(100, progress.TotalPoints);
        Assert.Equal(2, progress.CurrentStreak);
        Assert.Equal(today, progress.LastActivityDate);
        Assert.Empty(context.UserAchievements);
    }

    [Fact]
    public async Task ApplyOnUpdateAsync_AwardsFirstFollowUpOnlyOnce()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.UserProgress.Add(
            new UserProgress
            {
                UserId = 1,
                TotalPoints = 20,
                CurrentLevel = 1
            }
        );
        await context.SaveChangesAsync();

        var service = new GamificationService(context);
        var application = new JobApplication
        {
            UserId = 1,
            Status = JobApplicationStatus.Saved,
            NextFollowUpDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(3)
        };

        await service.ApplyOnUpdateAsync(
            application,
            previousStatus: JobApplicationStatus.Saved,
            previousFollowUpDate: null
        );
        await context.SaveChangesAsync();

        Assert.Equal(25, context.UserProgress.Single().TotalPoints);

        application.NextFollowUpDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(5);

        await service.ApplyOnUpdateAsync(
            application,
            previousStatus: JobApplicationStatus.Saved,
            previousFollowUpDate: null
        );
        await context.SaveChangesAsync();

        Assert.Equal(25, context.UserProgress.Single().TotalPoints);
    }

    [Fact]
    public async Task ApplyOnUpdateAsync_IncrementsStreakWhenLastActivityWasYesterday()
    {
        using var context = TestDbContextFactory.CreateContext();
        var yesterday = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-1);
        context.UserProgress.Add(
            new UserProgress
            {
                UserId = 1,
                CurrentStreak = 2,
                LastActivityDate = yesterday
            }
        );
        await context.SaveChangesAsync();

        var service = new GamificationService(context);

        await service.ApplyOnUpdateAsync(
            new JobApplication
            {
                UserId = 1,
                Status = JobApplicationStatus.Applied
            },
            previousStatus: JobApplicationStatus.Saved,
            previousFollowUpDate: null
        );
        await context.SaveChangesAsync();

        var progress = context.UserProgress.Single();

        Assert.Equal(3, progress.CurrentStreak);
        Assert.Contains(
            context.UserAchievements,
            userAchievement =>
                userAchievement.AchievementId
                == AchievementCatalog.ConsistentSeekerId
        );
    }

    [Fact]
    public async Task ApplyOnCreateAsync_UnlocksJobHunterAtFiveApplications()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.UserProgress.Add(
            new UserProgress
            {
                UserId = 1
            }
        );

        for (var index = 1; index <= 4; index++)
        {
            context.JobApplications.Add(
                new JobApplication
                {
                    UserId = 1,
                    CompanyName = $"Company {index}",
                    JobTitle = "Engineer"
                }
            );
        }

        await context.SaveChangesAsync();

        var service = new GamificationService(context);

        await service.ApplyOnCreateAsync(
            new JobApplication
            {
                UserId = 1,
                Status = JobApplicationStatus.Saved
            }
        );
        await context.SaveChangesAsync();

        Assert.Contains(
            context.UserAchievements,
            userAchievement =>
                userAchievement.AchievementId
                == AchievementCatalog.JobHunterId
        );
    }
}