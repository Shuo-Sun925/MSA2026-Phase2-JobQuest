using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class ApplicationUser
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<JobApplication> JobApplications { get; set; }
        = new List<JobApplication>();

    public UserProgress? Progress { get; set; }

    public ICollection<UserAchievement> UserAchievements { get; set; }
        = new List<UserAchievement>();
}