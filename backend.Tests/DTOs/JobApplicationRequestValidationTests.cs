using backend.DTOs.JobApplications;
using backend.Models;
using backend.Tests.TestHelpers;

namespace backend.Tests.DTOs;

public class JobApplicationRequestValidationTests
{
    [Fact]
    public void CreateRequest_FailsWhenSavedJobHasAppliedDate()
    {
        var results = ValidationTestHelper.Validate(
            new CreateJobApplicationRequest
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Saved,
                AppliedDate = new DateOnly(2026, 7, 1)
            }
        );

        Assert.Contains(
            results,
            result => result.ErrorMessage == "Saved applications cannot include an applied date. Clear the date or change the status to Applied."
        );
    }

    [Fact]
    public void CreateRequest_FailsWhenWithdrawnApplicationHasFollowUpDateAndAppliedDate()
    {
        var results = ValidationTestHelper.Validate(
            new CreateJobApplicationRequest
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Withdrawn,
                AppliedDate = new DateOnly(2026, 7, 1),
                NextFollowUpDate = new DateOnly(2026, 7, 2)
            }
        );

        Assert.Contains(
            results,
            result => result.ErrorMessage == "Withdrawn applications cannot include a follow-up date."
        );
    }

    [Fact]
    public void CreateRequest_FailsWhenFollowUpDateIsBeforeAppliedDate()
    {
        var results = ValidationTestHelper.Validate(
            new CreateJobApplicationRequest
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Applied,
                AppliedDate = new DateOnly(2026, 7, 10),
                NextFollowUpDate = new DateOnly(2026, 7, 9)
            }
        );

        Assert.Contains(
            results,
            result => result.ErrorMessage == "Next follow-up date cannot be before the applied date."
        );
    }

    [Fact]
    public void UpdateRequest_FailsWhenSavedJobHasAppliedDate()
    {
        var results = ValidationTestHelper.Validate(
            new UpdateJobApplicationRequest
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Saved,
                AppliedDate = new DateOnly(2026, 7, 1)
            }
        );

        Assert.Contains(
            results,
            result => result.ErrorMessage == "Saved applications cannot include an applied date. Clear the date or change the status to Applied."
        );
    }

    [Fact]
    public void UpdateRequest_FailsWhenFollowUpDateIsBeforeAppliedDate()
    {
        var results = ValidationTestHelper.Validate(
            new UpdateJobApplicationRequest
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Applied,
                AppliedDate = new DateOnly(2026, 7, 10),
                NextFollowUpDate = new DateOnly(2026, 7, 9)
            }
        );

        Assert.Contains(
            results,
            result => result.ErrorMessage == "Next follow-up date cannot be before the applied date."
        );
    }
}