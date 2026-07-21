using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class JobApplication
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public ApplicationUser? User { get; set; }

    [Required]
    [MaxLength(100)]
    public string CompanyName { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string JobTitle { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? Location { get; set; }

    [MaxLength(500)]
    public string? JobLink { get; set; }

    public JobApplicationStatus Status { get; set; }
        = JobApplicationStatus.Saved;

    public DateOnly? AppliedDate { get; set; }

    public DateOnly? NextFollowUpDate { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}