using backend.Models;
using backend.Services;

namespace backend.Tests.TestHelpers;

internal sealed class FakeGamificationService : IGamificationService
{
    public int CreateCalls { get; private set; }

    public int UpdateCalls { get; private set; }

    public JobApplication? LastApplication { get; private set; }

    public JobApplicationStatus? LastPreviousStatus { get; private set; }

    public DateOnly? LastPreviousFollowUpDate { get; private set; }

    public Task ApplyOnCreateAsync(JobApplication application)
    {
        CreateCalls++;
        LastApplication = application;
        return Task.CompletedTask;
    }

    public Task ApplyOnUpdateAsync(
        JobApplication application,
        JobApplicationStatus previousStatus,
        DateOnly? previousFollowUpDate)
    {
        UpdateCalls++;
        LastApplication = application;
        LastPreviousStatus = previousStatus;
        LastPreviousFollowUpDate = previousFollowUpDate;
        return Task.CompletedTask;
    }
}