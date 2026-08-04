using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Progress;

public class UpdateWeeklyGoalRequest
{
    [Range(
        1,
        20,
        ErrorMessage = "Weekly goal must be between 1 and 20."
    )]
    public int WeeklyGoal { get; set; }
}