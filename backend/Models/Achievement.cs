using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Achievement
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Icon { get; set; }

    [Required]
    [MaxLength(100)]
    public string ConditionType { get; set; } = string.Empty;


    [Range(1, int.MaxValue)]
    public int TargetValue { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserAchievement> UserAchievements { get; set; }
        = new List<UserAchievement>();
}