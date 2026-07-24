using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs.JobApplications;

public class UpdateJobApplicationRequest : IValidatableObject
{
    [Required(ErrorMessage = "Company name is required.")]
    [StringLength(
        100,
        ErrorMessage = "Company name cannot exceed 100 characters."
    )]
    public string CompanyName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Job title is required.")]
    [StringLength(
        150,
        ErrorMessage = "Job title cannot exceed 150 characters."
    )]
    public string JobTitle { get; set; } = string.Empty;

    [StringLength(
        150,
        ErrorMessage = "Location cannot exceed 150 characters."
    )]
    public string? Location { get; set; }

    [Url(ErrorMessage = "Job link must be a valid URL.")]
    [StringLength(
        500,
        ErrorMessage = "Job link cannot exceed 500 characters."
    )]
    public string? JobLink { get; set; }

    [EnumDataType(
        typeof(JobApplicationStatus),
        ErrorMessage = "Invalid job application status."
    )]
    public JobApplicationStatus Status { get; set; }

    public DateOnly? AppliedDate { get; set; }

    public DateOnly? NextFollowUpDate { get; set; }

    [StringLength(
        2000,
        ErrorMessage = "Notes cannot exceed 2000 characters."
    )]
    public string? Notes { get; set; }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext)
    {
        if (AppliedDate.HasValue
            && NextFollowUpDate.HasValue
            && NextFollowUpDate.Value < AppliedDate.Value)
        {
            yield return new ValidationResult(
                "Next follow-up date cannot be before the applied date.",
                new[]
                {
                    nameof(NextFollowUpDate)
                }
            );
        }
    }
}