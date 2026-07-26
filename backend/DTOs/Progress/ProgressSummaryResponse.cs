namespace backend.DTOs.Progress;

public class ProgressSummaryResponse
{
    public int TotalApplications { get; set; }

    public int ApplicationsThisWeek { get; set; }

    public int SavedCount { get; set; }

    public int AppliedCount { get; set; }

    public int OnlineAssessmentCount { get; set; }

    public int InterviewCount { get; set; }

    public int OfferCount { get; set; }

    public int RejectedCount { get; set; }

    public int WithdrawnCount { get; set; }

    public int TotalPoints { get; set; }

    public int CurrentLevel { get; set; }

    public int CurrentStreak { get; set; }

    public DateOnly? LastActivityDate { get; set; }

    public int WeeklyGoal { get; set; }

    public int WeeklyGoalProgress { get; set; }

    public int RemainingApplications { get; set; }

    public bool IsGoalMet { get; set; }
}