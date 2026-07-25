using backend.Models;

namespace backend.Helpers;

public static class JobApplicationStatusRules
{
    private static readonly IReadOnlyDictionary<
        JobApplicationStatus,
        IReadOnlySet<JobApplicationStatus>> AllowedTransitions =
        new Dictionary<
            JobApplicationStatus,
            IReadOnlySet<JobApplicationStatus>>
        {
            [JobApplicationStatus.Saved] =
                new HashSet<JobApplicationStatus>
                {
                    JobApplicationStatus.Applied,
                    JobApplicationStatus.OnlineAssessment,
                    JobApplicationStatus.Interview,
                    JobApplicationStatus.Offer,
                    JobApplicationStatus.Withdrawn
                },

            [JobApplicationStatus.Applied] =
                new HashSet<JobApplicationStatus>
                {
                    JobApplicationStatus.OnlineAssessment,
                    JobApplicationStatus.Interview,
                    JobApplicationStatus.Offer,
                    JobApplicationStatus.Rejected,
                    JobApplicationStatus.Withdrawn
                },

            [JobApplicationStatus.OnlineAssessment] =
                new HashSet<JobApplicationStatus>
                {
                    JobApplicationStatus.Interview,
                    JobApplicationStatus.Offer,
                    JobApplicationStatus.Rejected,
                    JobApplicationStatus.Withdrawn
                },

            [JobApplicationStatus.Interview] =
                new HashSet<JobApplicationStatus>
                {
                    JobApplicationStatus.Offer,
                    JobApplicationStatus.Rejected,
                    JobApplicationStatus.Withdrawn
                },

            [JobApplicationStatus.Offer] =
                new HashSet<JobApplicationStatus>(),

            [JobApplicationStatus.Rejected] =
                new HashSet<JobApplicationStatus>(),

            [JobApplicationStatus.Withdrawn] =
                new HashSet<JobApplicationStatus>()
        };

    public static bool IsValidTransition(
        JobApplicationStatus currentStatus,
        JobApplicationStatus newStatus)
    {
        // Same status is allowed so users can edit other fields.
        if (currentStatus == newStatus)
        {
            return true;
        }

        return AllowedTransitions.TryGetValue(
                currentStatus,
                out var validNextStatuses
            )
            && validNextStatuses.Contains(newStatus);
    }

    public static bool RepresentsAppliedJob(
        JobApplicationStatus status)
    {
        return status is
            JobApplicationStatus.Applied
            or JobApplicationStatus.OnlineAssessment
            or JobApplicationStatus.Interview
            or JobApplicationStatus.Offer
            or JobApplicationStatus.Rejected;
    }

    public static bool IsTerminalStatus(
        JobApplicationStatus status)
    {
        return status is
            JobApplicationStatus.Offer
            or JobApplicationStatus.Rejected
            or JobApplicationStatus.Withdrawn;
    }

    public static DateOnly? ResolveAppliedDate(
        JobApplicationStatus status,
        DateOnly? requestedAppliedDate,
        DateOnly? existingAppliedDate = null)
    {
        if (status == JobApplicationStatus.Saved)
        {
            return null;
        }

        if (requestedAppliedDate.HasValue)
        {
            return requestedAppliedDate;
        }

        if (existingAppliedDate.HasValue)
        {
            return existingAppliedDate;
        }

        // A saved job may be withdrawn before the user applies.
        if (status == JobApplicationStatus.Withdrawn)
        {
            return null;
        }

        return DateOnly.FromDateTime(DateTime.UtcNow);
    }
}