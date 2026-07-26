using backend.Models;

namespace backend.Helpers;

public static class AchievementCatalog
{
    public const int FirstApplicationId = 1;
    public const int JobHunterId = 2;
    public const int ConsistentSeekerId = 3;
    public const int InterviewUnlockedId = 4;
    public const int OfferHunterId = 5;

    private static readonly DateTime SeedCreatedAt =
        new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public static readonly Achievement[] All =
    [
        new Achievement
        {
            Id = FirstApplicationId,
            Name = "First Application",
            Description = "Create your first job application.",
            Icon = "rocket",
            ConditionType = "applications_created",
            TargetValue = 1,
            CreatedAt = SeedCreatedAt
        },
        new Achievement
        {
            Id = JobHunterId,
            Name = "Job Hunter",
            Description = "Create five job applications.",
            Icon = "briefcase",
            ConditionType = "applications_created",
            TargetValue = 5,
            CreatedAt = SeedCreatedAt
        },
        new Achievement
        {
            Id = ConsistentSeekerId,
            Name = "Consistent Seeker",
            Description = "Reach a 3-day activity streak.",
            Icon = "calendar",
            ConditionType = "streak_days",
            TargetValue = 3,
            CreatedAt = SeedCreatedAt
        },
        new Achievement
        {
            Id = InterviewUnlockedId,
            Name = "Interview Unlocked",
            Description = "Reach the interview stage.",
            Icon = "sparkles",
            ConditionType = "status_reached",
            TargetValue = 4,
            CreatedAt = SeedCreatedAt
        },
        new Achievement
        {
            Id = OfferHunterId,
            Name = "Offer Hunter",
            Description = "Reach the offer stage.",
            Icon = "trophy",
            ConditionType = "status_reached",
            TargetValue = 5,
            CreatedAt = SeedCreatedAt
        }
    ];
}