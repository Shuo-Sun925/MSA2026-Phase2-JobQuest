using backend.DTOs.Achievements;
using backend.DTOs.Progress;
using backend.Helpers;
using backend.Models;
using backend.Services;
using backend.Tests.TestHelpers;

namespace backend.Tests.Services;

public class ProgressServiceTests
{
    [Fact]
    public async Task GetProgressAsync_ReturnsStoredProgressForCurrentUser()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.UserProgress.AddRange(
            new UserProgress
            {
                UserId = 1,
                TotalPoints = 120,
                CurrentLevel = 3,
                CurrentStreak = 4,
                LastActivityDate = new DateOnly(2026, 7, 20),
                WeeklyGoal = 6
            },
            new UserProgress
            {
                UserId = 2,
                TotalPoints = 20,
                CurrentLevel = 1,
                CurrentStreak = 1,
                WeeklyGoal = 3
            }
        );
        await context.SaveChangesAsync();

        var service = new ProgressService(context);

        var response = await service.GetProgressAsync(1);

        Assert.IsType<ProgressResponse>(response);
        Assert.Equal(120, response.TotalPoints);
        Assert.Equal(3, response.CurrentLevel);
        Assert.Equal(4, response.CurrentStreak);
        Assert.Equal(new DateOnly(2026, 7, 20), response.LastActivityDate);
        Assert.Equal(6, response.WeeklyGoal);
    }

    [Fact]
    public async Task GetProgressAsync_ReturnsDefaultValuesWhenProgressIsMissing()
    {
        using var context = TestDbContextFactory.CreateContext();
        var service = new ProgressService(context);

        var response = await service.GetProgressAsync(99);

        Assert.Equal(0, response.TotalPoints);
        Assert.Equal(1, response.CurrentLevel);
        Assert.Equal(0, response.CurrentStreak);
        Assert.Null(response.LastActivityDate);
        Assert.Equal(5, response.WeeklyGoal);
    }

    [Fact]
    public async Task GetWeeklyGoalProgressAsync_CountsApplicationsByAppliedDateForCurrentWeek()
    {
        using var context = TestDbContextFactory.CreateContext();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var weekStart = today.AddDays(-(((int)today.DayOfWeek + 6) % 7));

        context.UserProgress.Add(
            new UserProgress
            {
                UserId = 1,
                WeeklyGoal = 3
            }
        );

        context.JobApplications.AddRange(
            new JobApplication
            {
                UserId = 1,
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Applied,
                AppliedDate = weekStart
            },
            new JobApplication
            {
                UserId = 1,
                CompanyName = "Litware",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Withdrawn,
                AppliedDate = weekStart.AddDays(1)
            },
            new JobApplication
            {
                UserId = 1,
                CompanyName = "Tailspin",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Saved
            },
            new JobApplication
            {
                UserId = 1,
                CompanyName = "Northwind",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Applied,
                AppliedDate = weekStart.AddDays(-1)
            },
            new JobApplication
            {
                UserId = 2,
                CompanyName = "Fabrikam",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Applied,
                AppliedDate = weekStart
            }
        );
        await context.SaveChangesAsync();

        var service = new ProgressService(context);

        var response = await service.GetWeeklyGoalProgressAsync(1);

        Assert.Equal(3, response.WeeklyGoal);
        Assert.Equal(2, response.AppliedThisWeek);
        Assert.Equal(1, response.RemainingApplications);
        Assert.False(response.IsGoalMet);
        Assert.Equal(weekStart, response.WeekStartDate);
    }

    [Fact]
    public async Task GetProgressSummaryAsync_ReturnsCountsAndGoalProgressForCurrentUserOnly()
    {
        using var context = TestDbContextFactory.CreateContext();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var weekStart = today.AddDays(-(((int)today.DayOfWeek + 6) % 7));

        context.UserProgress.AddRange(
            new UserProgress
            {
                UserId = 1,
                TotalPoints = 165,
                CurrentLevel = 3,
                CurrentStreak = 2,
                LastActivityDate = today,
                WeeklyGoal = 4
            },
            new UserProgress
            {
                UserId = 2,
                TotalPoints = 50,
                CurrentLevel = 2,
                CurrentStreak = 1,
                WeeklyGoal = 1
            }
        );

        context.JobApplications.AddRange(
            CreateApplication(1, JobApplicationStatus.Saved, null),
            CreateApplication(1, JobApplicationStatus.Applied, weekStart),
            CreateApplication(1, JobApplicationStatus.OnlineAssessment, weekStart.AddDays(1)),
            CreateApplication(1, JobApplicationStatus.Interview, weekStart.AddDays(2)),
            CreateApplication(1, JobApplicationStatus.Offer, weekStart.AddDays(3)),
            CreateApplication(1, JobApplicationStatus.Rejected, weekStart.AddDays(-7)),
            CreateApplication(1, JobApplicationStatus.Withdrawn, weekStart.AddDays(1)),
            CreateApplication(2, JobApplicationStatus.Offer, weekStart)
        );
        await context.SaveChangesAsync();

        var service = new ProgressService(context);

        var response = await service.GetProgressSummaryAsync(1);

        Assert.IsType<ProgressSummaryResponse>(response);
        Assert.Equal(7, response.TotalApplications);
        Assert.Equal(5, response.ApplicationsThisWeek);
        Assert.Equal(1, response.SavedCount);
        Assert.Equal(1, response.AppliedCount);
        Assert.Equal(1, response.OnlineAssessmentCount);
        Assert.Equal(1, response.InterviewCount);
        Assert.Equal(1, response.OfferCount);
        Assert.Equal(1, response.RejectedCount);
        Assert.Equal(1, response.WithdrawnCount);
        Assert.Equal(165, response.TotalPoints);
        Assert.Equal(3, response.CurrentLevel);
        Assert.Equal(2, response.CurrentStreak);
        Assert.Equal(today, response.LastActivityDate);
        Assert.Equal(4, response.WeeklyGoal);
        Assert.Equal(5, response.WeeklyGoalProgress);
        Assert.Equal(0, response.RemainingApplications);
        Assert.True(response.IsGoalMet);
    }

    [Fact]
    public async Task GetAchievementsAsync_ReturnsTemplatesWithUnlockedState()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.Achievements.AddRange(AchievementCatalog.All);
        context.UserAchievements.AddRange(
            new UserAchievement
            {
                UserId = 1,
                AchievementId = AchievementCatalog.FirstApplicationId,
                UnlockedAt = new DateTime(2026, 7, 1, 10, 0, 0, DateTimeKind.Utc)
            },
            new UserAchievement
            {
                UserId = 1,
                AchievementId = AchievementCatalog.OfferHunterId,
                UnlockedAt = new DateTime(2026, 7, 10, 10, 0, 0, DateTimeKind.Utc)
            },
            new UserAchievement
            {
                UserId = 2,
                AchievementId = AchievementCatalog.JobHunterId,
                UnlockedAt = new DateTime(2026, 7, 20, 10, 0, 0, DateTimeKind.Utc)
            }
        );
        await context.SaveChangesAsync();

        var service = new ProgressService(context);

        var response = await service.GetAchievementsAsync(1);

        Assert.IsAssignableFrom<IReadOnlyList<AchievementResponse>>(response);
        Assert.Equal(5, response.Count);
        Assert.True(response.Single(item => item.Id == AchievementCatalog.FirstApplicationId).IsUnlocked);
        Assert.True(response.Single(item => item.Id == AchievementCatalog.OfferHunterId).IsUnlocked);
        Assert.False(response.Single(item => item.Id == AchievementCatalog.JobHunterId).IsUnlocked);
        Assert.Equal(
            new DateTime(2026, 7, 10, 10, 0, 0, DateTimeKind.Utc),
            response.Single(item => item.Id == AchievementCatalog.OfferHunterId).UnlockedAt
        );
    }

    private static JobApplication CreateApplication(
        int userId,
        JobApplicationStatus status,
        DateOnly? appliedDate)
    {
        return new JobApplication
        {
            UserId = userId,
            CompanyName = Guid.NewGuid().ToString(),
            JobTitle = "Engineer",
            Status = status,
            AppliedDate = appliedDate
        };
    }
}