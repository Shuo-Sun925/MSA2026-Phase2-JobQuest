using backend.Models;

namespace backend.Services;

public interface IGamificationService
{
    Task ApplyOnCreateAsync(
        JobApplication application);

    Task ApplyOnUpdateAsync(
        JobApplication application,
        JobApplicationStatus previousStatus,
        DateOnly? previousFollowUpDate);
}