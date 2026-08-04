using backend.Models;

namespace backend.Helpers;

public static class GamificationRules
{
    public const int ApplicationCreatedPoints = 10;
    public const int AppliedPoints = 10;
    public const int OnlineAssessmentPoints = 15;
    public const int InterviewPoints = 30;
    public const int OfferPoints = 100;
    public const int FollowUpAddedPoints = 5;

    private static readonly JobApplicationStatus[] RewardedStatuses =
    [
        JobApplicationStatus.Applied,
        JobApplicationStatus.OnlineAssessment,
        JobApplicationStatus.Interview,
        JobApplicationStatus.Offer
    ];

    public static int GetLevelForPoints(int totalPoints)
    {
        return totalPoints switch
        {
            >= 350 => 5,
            >= 200 => 4,
            >= 100 => 3,
            >= 50 => 2,
            _ => 1
        };
    }

    public static int GetCreateStatusPoints(
        JobApplicationStatus status)
    {
        if (!IsRewardedStatus(status))
        {
            return 0;
        }

        return RewardedStatuses
            .TakeWhile(rewardedStatus =>
                rewardedStatus != status)
            .Sum(GetPointsForStatus)
            + GetPointsForStatus(status);
    }

    public static int GetTransitionStatusPoints(
        JobApplicationStatus previousStatus,
        JobApplicationStatus newStatus)
    {
        if (!IsRewardedStatus(newStatus))
        {
            return 0;
        }

        return RewardedStatuses
            .Where(status =>
                IsAfter(status, previousStatus)
                && IsAtOrBefore(status, newStatus)
            )
            .Sum(GetPointsForStatus);
    }

    public static bool HasReachedInterview(
        JobApplicationStatus status)
    {
        return IsAtOrBefore(
            JobApplicationStatus.Interview,
            status
        );
    }

    public static bool HasReachedOffer(
        JobApplicationStatus status)
    {
        return status == JobApplicationStatus.Offer;
    }

    private static bool IsRewardedStatus(
        JobApplicationStatus status)
    {
        return RewardedStatuses.Contains(status);
    }

    private static bool IsAfter(
        JobApplicationStatus candidate,
        JobApplicationStatus boundary)
    {
        return GetRewardIndex(candidate)
            > GetRewardIndex(boundary);
    }

    private static bool IsAtOrBefore(
        JobApplicationStatus candidate,
        JobApplicationStatus boundary)
    {
        return GetRewardIndex(candidate)
            <= GetRewardIndex(boundary);
    }

    private static int GetRewardIndex(
        JobApplicationStatus status)
    {
        return status switch
        {
            JobApplicationStatus.Saved => -1,
            JobApplicationStatus.Applied => 0,
            JobApplicationStatus.OnlineAssessment => 1,
            JobApplicationStatus.Interview => 2,
            JobApplicationStatus.Offer => 3,
            JobApplicationStatus.Rejected => -1,
            JobApplicationStatus.Withdrawn => -1,
            _ => -1
        };
    }

    private static int GetPointsForStatus(
        JobApplicationStatus status)
    {
        return status switch
        {
            JobApplicationStatus.Applied => AppliedPoints,
            JobApplicationStatus.OnlineAssessment =>
                OnlineAssessmentPoints,
            JobApplicationStatus.Interview => InterviewPoints,
            JobApplicationStatus.Offer => OfferPoints,
            _ => 0
        };
    }
}