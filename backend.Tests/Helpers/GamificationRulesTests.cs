using backend.Helpers;
using backend.Models;

namespace backend.Tests.Helpers;

public class GamificationRulesTests
{
    [Theory]
    [InlineData(0, 1)]
    [InlineData(49, 1)]
    [InlineData(50, 2)]
    [InlineData(99, 2)]
    [InlineData(100, 3)]
    [InlineData(199, 3)]
    [InlineData(200, 4)]
    [InlineData(349, 4)]
    [InlineData(350, 5)]
    public void GetLevelForPoints_ReturnsExpectedLevel(
        int totalPoints,
        int expectedLevel)
    {
        Assert.Equal(
            expectedLevel,
            GamificationRules.GetLevelForPoints(totalPoints)
        );
    }

    [Theory]
    [InlineData(JobApplicationStatus.Saved, 0)]
    [InlineData(JobApplicationStatus.Applied, 10)]
    [InlineData(JobApplicationStatus.OnlineAssessment, 25)]
    [InlineData(JobApplicationStatus.Interview, 55)]
    [InlineData(JobApplicationStatus.Offer, 155)]
    [InlineData(JobApplicationStatus.Rejected, 0)]
    [InlineData(JobApplicationStatus.Withdrawn, 0)]
    public void GetCreateStatusPoints_ReturnsCumulativeStagePoints(
        JobApplicationStatus status,
        int expectedPoints)
    {
        Assert.Equal(
            expectedPoints,
            GamificationRules.GetCreateStatusPoints(status)
        );
    }

    [Theory]
    [InlineData(JobApplicationStatus.Saved, JobApplicationStatus.Applied, 10)]
    [InlineData(JobApplicationStatus.Applied, JobApplicationStatus.Interview, 45)]
    [InlineData(JobApplicationStatus.Applied, JobApplicationStatus.Offer, 145)]
    [InlineData(JobApplicationStatus.OnlineAssessment, JobApplicationStatus.Offer, 130)]
    [InlineData(JobApplicationStatus.Applied, JobApplicationStatus.Withdrawn, 0)]
    [InlineData(JobApplicationStatus.Saved, JobApplicationStatus.Withdrawn, 0)]
    public void GetTransitionStatusPoints_ReturnsExpectedPoints(
        JobApplicationStatus previousStatus,
        JobApplicationStatus newStatus,
        int expectedPoints)
    {
        Assert.Equal(
            expectedPoints,
            GamificationRules.GetTransitionStatusPoints(
                previousStatus,
                newStatus
            )
        );
    }

    [Theory]
    [InlineData(JobApplicationStatus.Saved, false)]
    [InlineData(JobApplicationStatus.Interview, true)]
    [InlineData(JobApplicationStatus.Offer, true)]
    [InlineData(JobApplicationStatus.Rejected, false)]
    public void HasReachedInterview_ReturnsExpectedResult(
        JobApplicationStatus status,
        bool expected)
    {
        Assert.Equal(
            expected,
            GamificationRules.HasReachedInterview(status)
        );
    }

    [Theory]
    [InlineData(JobApplicationStatus.Offer, true)]
    [InlineData(JobApplicationStatus.Interview, false)]
    [InlineData(JobApplicationStatus.Withdrawn, false)]
    public void HasReachedOffer_ReturnsExpectedResult(
        JobApplicationStatus status,
        bool expected)
    {
        Assert.Equal(
            expected,
            GamificationRules.HasReachedOffer(status)
        );
    }
}