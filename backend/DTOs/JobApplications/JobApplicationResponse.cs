using backend.Models;

namespace backend.DTOs.JobApplications;

public class JobApplicationResponse
{
    public int Id { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string JobTitle { get; set; } = string.Empty;

    public string? Location { get; set; }

    public string? JobLink { get; set; }

    public JobApplicationStatus Status { get; set; }

    public DateOnly? AppliedDate { get; set; }

    public DateOnly? NextFollowUpDate { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}