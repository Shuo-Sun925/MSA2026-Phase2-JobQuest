namespace backend.Models;

public class UserAchievement
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public int AchievementId { get; set; }

    public Achievement Achievement { get; set; } = null!;

    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;
}