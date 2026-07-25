namespace backend.DTOs.JobApplications;

public class WeeklyGoalProgressResponse
{
    public int WeeklyGoal { get; set; }

    public int AppliedThisWeek { get; set; }

    public int RemainingApplications { get; set; }

    public bool IsGoalMet { get; set; }

    public DateOnly WeekStartDate { get; set; }

    public DateOnly WeekEndDate { get; set; }
}