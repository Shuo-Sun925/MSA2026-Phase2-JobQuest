# JobQuest Gamification and Business Rules

## Scope

This document describes the final implemented business rules based on:

- `backend/Helpers/GamificationRules.cs`
- `backend/Helpers/JobApplicationStatusRules.cs`
- `backend/Helpers/AchievementCatalog.cs`
- `backend/Services/GamificationService.cs`
- `backend/Services/ProgressService.cs`
- the related backend tests

## Job Application Statuses

The final status enum is defined in `backend/Models/JobApplicationStatus.cs`.

Statuses:

- `Saved`
- `Applied`
- `OnlineAssessment`
- `Interview`
- `Offer`
- `Rejected`
- `Withdrawn`

## Meaning of Each Status

The meaning of each status comes from the final rules and UI wording.

- `Saved`: the opportunity is tracked but not yet treated as an applied job
- `Applied`: the application has been submitted
- `OnlineAssessment`: the candidate has progressed to an online assessment stage
- `Interview`: the application has reached the interview stage
- `Offer`: the application has reached the offer stage
- `Rejected`: the application ended unsuccessfully after being treated as an applied job
- `Withdrawn`: the user withdrew the application, and this can happen even before an applied date exists

## Allowed Status Transitions

The final transition matrix is defined in `JobApplicationStatusRules.AllowedTransitions`.

### From `Saved`

Allowed:

- `Applied`
- `OnlineAssessment`
- `Interview`
- `Offer`
- `Withdrawn`

### From `Applied`

Allowed:

- `OnlineAssessment`
- `Interview`
- `Offer`
- `Rejected`
- `Withdrawn`

### From `OnlineAssessment`

Allowed:

- `Interview`
- `Offer`
- `Rejected`
- `Withdrawn`

### From `Interview`

Allowed:

- `Offer`
- `Rejected`
- `Withdrawn`

### From terminal states

No forward transitions are allowed from:

- `Offer`
- `Rejected`
- `Withdrawn`

### Same-status edits

Same-status updates are allowed so that users can edit non-status fields without changing the application stage.

## Are Backwards Transitions Allowed?

No. The final implementation rejects backwards transitions.

Examples:

- `Offer` cannot move back to `Interview`
- `Interview` cannot move back to `Applied`
- `OnlineAssessment` cannot move back to `Saved`

This is enforced in `JobApplicationsController.Update` through `JobApplicationStatusRules.IsValidTransition` and is covered by tests such as `Update_ReturnsBadRequestForInvalidStatusTransition` in `backend.Tests/Controllers/JobApplicationsControllerTests.cs`.

## Is Stage Skipping Allowed?

Yes. The final implementation allows direct jumps to later stages.

Examples supported by the rules:

- `Saved` -> `Interview`
- `Saved` -> `Offer`
- `Applied` -> `Offer`

This matters for scoring, because skipped rewarded stages still count toward cumulative status points.

## Terminal States

The final implementation treats these as terminal states:

- `Offer`
- `Rejected`
- `Withdrawn`

`JobApplicationStatusRules.IsTerminalStatus` is used to clear follow-up dates for terminal states.

## Rules for Offer, Rejected, and Withdrawn

### Offer

- terminal
- counted as a reached offer for achievements
- rewarded with offer-stage points
- cannot transition forward or backward later
- follow-up date is cleared when saved through update logic

### Rejected

- terminal
- not a rewarded status for points by itself
- counts toward weekly progress only when it has a non-null `AppliedDate` within the current weekly date range
- follow-up date is cleared on update because it is terminal

### Withdrawn

- terminal
- not a rewarded status for points by itself
- may exist without an applied date when a saved job is withdrawn before applying
- create validation prevents a withdrawn application from including both an applied date and a follow-up date
- follow-up date is cleared when saved through create or update logic

## Applied Date Rules

`JobApplicationStatusRules.ResolveAppliedDate` controls the final `AppliedDate` behavior.

Rules:

- `Saved` always resolves to `null`
- if a request provides `appliedDate`, that value is used
- if an existing `AppliedDate` already exists during update, it is preserved when the new request omits one
- if the status is `Withdrawn` and the user never applied, `AppliedDate` can remain `null`
- otherwise, non-saved non-withdrawn statuses default to today's UTC date when an applied date was not supplied

## Points-Awarding Rules

The final scoring rules are defined in `GamificationRules.cs` and applied in `GamificationService.cs`.

| Action or milestone | Points |
|---|---:|
| Create an application | 10 |
| Reach `Applied` | 10 |
| Reach `OnlineAssessment` | 15 |
| Reach `Interview` | 30 |
| Reach `Offer` | 100 |
| Add the first follow-up date | 5 |

### Base creation reward

- creating a job application always awards `10` points

### Rewarded status points

- `Applied`: `10`
- `OnlineAssessment`: `15`
- `Interview`: `30`
- `Offer`: `100`

### Follow-up reward

- adding a first follow-up date awards `5` points
- this reward is tracked through `HasEarnedFollowUpPoints`

### Create-time cumulative status points

When an application is created directly at a later rewarded stage, the final implementation awards cumulative status points up to that stage.

Examples:

- create as `Applied`: `10` base + `10` status = `20`
- create as `Interview`: `10` base + `10` + `15` + `30` = `65`

This behavior is confirmed by `ApplyOnCreateAsync_AwardsCumulativePointsForDirectInterviewCreation` in `backend.Tests/Services/GamificationServiceTests.cs`.

### Update-time transition points

When a status changes, the final implementation awards the sum of rewarded stages crossed between the previous status and the new status.

Example:

- `Applied` -> `Offer` awards `15 + 30 + 100 = 145`

This is confirmed by `ApplyOnUpdateAsync_AwardsSkippedStagesAndOfferAchievement`.

### Non-rewarded cases

No status points are awarded for:

- `Saved`
- `Rejected`
- `Withdrawn`
- same-status edits

## Level Calculation

Level thresholds are defined in `GamificationRules.GetLevelForPoints`.

- Level 1: `0-49`
- Level 2: `50-99`
- Level 3: `100-199`
- Level 4: `200-349`
- Level 5: `350+`

The frontend helper in `frontend/src/helpers/levelProgress.ts` mirrors these thresholds for display.

## Streak Calculation

Streak logic is implemented in `GamificationService.UpdateStreak`.

Rules:

- if the last activity date is today, the streak does not increase again
- if the last activity date was yesterday, the streak increases by 1
- otherwise, the streak resets to 1 when new activity occurs
- any qualifying activity updates `LastActivityDate` to today

Qualifying activity in practice comes from:

- creating an application
- changing an application status
- adding the first follow-up date

Same-status edits that only change notes, company name, job title, links, or other non-stage fields do not update the streak. A same-status edit can still count as activity when it adds the first follow-up date, because that path awards the one-time follow-up reward and calls `UpdateStreak`.

This behavior is covered by tests including `ApplyOnUpdateAsync_IncrementsStreakWhenLastActivityWasYesterday` and `ApplyOnUpdateAsync_DoesNotAwardDuplicatePointsForSameStatusEdit`.

## Achievement Unlock Rules

The available achievement templates are seeded in `AchievementCatalog.All`.

### First Application

- unlocked when the user's created application count reaches at least 1

### Job Hunter

- unlocked when the user's created application count reaches at least 5

### Consistent Seeker

- unlocked when `CurrentStreak >= 3`

### Interview Unlocked

- unlocked only when the application status is `Interview` or `Offer`
- `Rejected` and `Withdrawn` do not count as having reached interview
- this is implemented through the custom reward-index logic inside `GamificationRules.HasReachedInterview`, not by relying on raw enum ordering

### Offer Hunter

- unlocked when the application status is `Offer`

Duplicate unlock rows are prevented by checking existing user-achievement rows before insert.

## Weekly Goal Calculation

Weekly goal behavior is implemented in `ProgressService.GetWeeklyGoalProgressAsync` and `UpdateWeeklyGoalAsync`.

Rules:

- the default weekly goal is `5`
- valid user-set goals must be between `1` and `20`
- the week starts on Monday
- `RemainingApplications = max(weeklyGoal - appliedThisWeek, 0)`
- `IsGoalMet` becomes `true` when `appliedThisWeek >= weeklyGoal`

## Relevant Date Field Used for Weekly Progress

Weekly progress is calculated from `AppliedDate`, not from `CreatedAt`, `UpdatedAt`, or status alone.

Only applications with a non-null `AppliedDate` inside the current Monday-to-Sunday window count toward `AppliedThisWeek`.

A rejected application counts toward weekly progress only when it has a non-null `AppliedDate` within the current weekly date range.

This is confirmed by:

- `backend/Services/ProgressService.cs`
- `backend.Tests/Services/ProgressServiceTests.cs`
- `backend.Tests/Integration/ProgressSummaryIntegrationTests.cs`

## Behavior When Applications Are Created, Updated, or Deleted

### Create

On create:

- the application is assigned to the authenticated user
- text fields are trimmed or normalized
- `AppliedDate` may be auto-resolved
- terminal status rules can clear follow-up dates
- gamification logic runs before save

### Update

On update:

- ownership is checked first
- invalid backwards transitions are rejected
- same-status edits are allowed
- `AppliedDate` and follow-up rules are re-evaluated
- gamification logic can award transition points, follow-up points, streak changes, and achievements

### Delete

On delete:

- only the owner can delete the application
- the row is removed
- there is no reverse recalculation of previously earned points, current level, streak history, or unlocked achievements in the current implementation
- gamification is therefore treated as historical earned progress rather than fully recalculated state

## How Repeated Point Farming Is Prevented

The final implementation uses several protections:

1. Backwards status transitions are disallowed.
2. Same-status edits do not award duplicate stage points.
3. Follow-up points can only be earned once because `HasEarnedFollowUpPoints` is stored on the application.
4. Duplicate achievement rows are blocked by both code checks and a unique `(UserId, AchievementId)` constraint.

## Edge Cases Covered by Tests

The test suite covers a number of important edge cases, including:

- direct creation at `Interview` awarding cumulative points
- awarding follow-up points only once
- awarding skipped-stage points on large forward jumps
- not awarding duplicate points for same-status edits
- incrementing streak when the previous activity was yesterday
- unlocking `Job Hunter` at five applications
- counting weekly applications by `AppliedDate` only
- falling back to the default weekly goal when a stored value is invalid
- rejecting weekly goals below 1 or above 20
- preserving cross-user separation in progress and job applications

Key evidence:

- `backend.Tests/Services/GamificationServiceTests.cs`
- `backend.Tests/Services/ProgressServiceTests.cs`
- `backend.Tests/Controllers/JobApplicationsControllerTests.cs`
- `backend.Tests/Integration/GamificationIntegrationTests.cs`
- `backend.Tests/Integration/ProgressSummaryIntegrationTests.cs`
- `backend.Tests/Integration/ProgressWeeklyGoalIntegrationTests.cs`
