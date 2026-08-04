namespace backend.DTOs.Progress;

public class ProgressResponse
{
    public int TotalPoints { get; set; }

    public int CurrentLevel { get; set; }

    public int CurrentStreak { get; set; }

    public DateOnly? LastActivityDate { get; set; }

    public int WeeklyGoal { get; set; }
}