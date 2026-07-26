namespace backend.DTOs.Achievements;

public class AchievementResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? Icon { get; set; }

    public string ConditionType { get; set; } = string.Empty;

    public int TargetValue { get; set; }

    public bool IsUnlocked { get; set; }

    public DateTime? UnlockedAt { get; set; }
}