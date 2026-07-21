using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class UserProgress
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public ApplicationUser? User { get; set; }

    public int TotalPoints { get; set; } = 0;

    public int CurrentLevel { get; set; } = 1;

    public int CurrentStreak { get; set; } = 0;

    public DateOnly? LastActivityDate { get; set; }

    [Range(1, 100)]
    public int WeeklyGoal { get; set; } = 5;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}