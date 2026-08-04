using backend.Helpers;
using backend.Models;

namespace backend.Tests.Helpers;

public class JobApplicationStatusRulesTests
{
    [Theory]
    [InlineData(JobApplicationStatus.Saved, JobApplicationStatus.Applied, true)]
    [InlineData(JobApplicationStatus.Applied, JobApplicationStatus.Interview, true)]
    [InlineData(JobApplicationStatus.Interview, JobApplicationStatus.Offer, true)]
    [InlineData(JobApplicationStatus.Saved, JobApplicationStatus.Rejected, false)]
    [InlineData(JobApplicationStatus.Offer, JobApplicationStatus.Interview, false)]
    [InlineData(JobApplicationStatus.Rejected, JobApplicationStatus.Applied, false)]
    [InlineData(JobApplicationStatus.Applied, JobApplicationStatus.Applied, true)]
    public void IsValidTransition_ReturnsExpectedResult(
        JobApplicationStatus currentStatus,
        JobApplicationStatus newStatus,
        bool expected)
    {
        var result = JobApplicationStatusRules.IsValidTransition(
            currentStatus,
            newStatus
        );

        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(JobApplicationStatus.Applied, true)]
    [InlineData(JobApplicationStatus.Interview, true)]
    [InlineData(JobApplicationStatus.Rejected, true)]
    [InlineData(JobApplicationStatus.Saved, false)]
    [InlineData(JobApplicationStatus.Withdrawn, false)]
    public void RepresentsAppliedJob_ReturnsExpectedResult(
        JobApplicationStatus status,
        bool expected)
    {
        Assert.Equal(
            expected,
            JobApplicationStatusRules.RepresentsAppliedJob(status)
        );
    }

    [Theory]
    [InlineData(JobApplicationStatus.Offer, true)]
    [InlineData(JobApplicationStatus.Rejected, true)]
    [InlineData(JobApplicationStatus.Withdrawn, true)]
    [InlineData(JobApplicationStatus.Interview, false)]
    public void IsTerminalStatus_ReturnsExpectedResult(
        JobApplicationStatus status,
        bool expected)
    {
        Assert.Equal(
            expected,
            JobApplicationStatusRules.IsTerminalStatus(status)
        );
    }

    [Fact]
    public void ResolveAppliedDate_ReturnsNullForSavedStatus()
    {
        var result = JobApplicationStatusRules.ResolveAppliedDate(
            JobApplicationStatus.Saved,
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        Assert.Null(result);
    }

    [Fact]
    public void ResolveAppliedDate_UsesRequestedDateWhenProvided()
    {
        var requestedDate = new DateOnly(2026, 7, 1);

        var result = JobApplicationStatusRules.ResolveAppliedDate(
            JobApplicationStatus.Applied,
            requestedDate
        );

        Assert.Equal(requestedDate, result);
    }

    [Fact]
    public void ResolveAppliedDate_PreservesExistingDateOnWithdrawnFromApplied()
    {
        var existingDate = new DateOnly(2026, 7, 10);

        var result = JobApplicationStatusRules.ResolveAppliedDate(
            JobApplicationStatus.Withdrawn,
            requestedAppliedDate: null,
            existingAppliedDate: existingDate
        );

        Assert.Equal(existingDate, result);
    }

    [Fact]
    public void ResolveAppliedDate_ReturnsNullForWithdrawnWithoutExistingDate()
    {
        var result = JobApplicationStatusRules.ResolveAppliedDate(
            JobApplicationStatus.Withdrawn,
            requestedAppliedDate: null,
            existingAppliedDate: null
        );

        Assert.Null(result);
    }

    [Fact]
    public void ResolveAppliedDate_DefaultsToTodayForAppliedStages()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var result = JobApplicationStatusRules.ResolveAppliedDate(
            JobApplicationStatus.Interview,
            requestedAppliedDate: null,
            existingAppliedDate: null
        );

        Assert.Equal(today, result);
    }
}