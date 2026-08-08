# JobQuest Agent Instructions

These instructions are for a future AI coding agent or developer working on JobQuest.

## Working Principles

- Read the existing code before changing it.
- Treat the committed source code, tests, and configuration as the source of truth.
- Preserve the current architecture unless a task explicitly requires architectural change.
- Do not add unnecessary features just because a tool or library is available.
- Do not describe planned-but-unimplemented features as complete.

## Frontend Rules

- Keep React routes consistent with `frontend/src/App.tsx`.
- Use the existing page-first structure in `frontend/src/pages`.
- Keep shared state in the existing Zustand stores under `frontend/src/store` when state must survive across pages.
- Keep frontend request and response types aligned with the backend DTO contracts.
- Continue using the existing Axios client in `frontend/src/services/api.ts` for authenticated API calls.
- Preserve theme-switching behavior implemented through `useDashboardTheme.ts`, `App.css`, and `index.css`.
- Keep desktop and mobile behavior responsive when modifying page layouts.
- Reset related client state on logout or authentication failure, following the pattern in `useAuthStore.ts`.

## Backend Rules

- Keep API routes consistent with the existing controller route patterns in `backend/Controllers`.
- Continue using username/password authentication with JWT bearer tokens unless explicitly asked to redesign auth.
- Protect all user-specific data with `[Authorize]` and current-user ownership checks.
- Use `UserClaimsHelper.TryGetUserId` for extracting the current user ID from claims.
- Keep request validation in DTOs where possible so `[ApiController]` can enforce it automatically.
- Keep business rules aligned with `GamificationRules.cs`, `JobApplicationStatusRules.cs`, `GamificationService.cs`, and `ProgressService.cs`.
- Continue using Scalar rather than Swagger UI.
- Do not introduce secrets into source files, test files, or documentation.

## Critical Business Rules

- Job application statuses cannot move backwards.
- `Offer`, `Rejected`, and `Withdrawn` are terminal states.
- Valid forward stage skipping is allowed.
- Same-status edits are allowed so users can change other fields without changing stage.
- Same-status edits must not award duplicate stage points.
- Follow-up points can only be earned once per application.
- Achievement unlocks must not create duplicate `UserAchievement` rows.
- Weekly progress must continue to be calculated from `AppliedDate`.
- A withdrawn application can preserve an existing `AppliedDate`, but terminal-status handling must clear `NextFollowUpDate` before persistence.
- Changes to status or gamification logic must be kept aligned with `GamificationRules.cs`, `JobApplicationStatusRules.cs`, `GamificationService.cs`, `ProgressService.cs`, and related backend tests.

## Data and Persistence Rules

- Keep the EF Core model aligned with `ApplicationDbContext` and the existing migrations strategy.
- Do not store plain-text passwords.
- Preserve multi-user data separation through `UserId`-scoped queries.
- If an entity or DTO changes, update both the backend and the frontend types and services that depend on it.
- If schema changes are required, add EF Core migrations rather than changing only the model classes.

## Testing Rules

- Update or add backend tests when business behavior changes.
- Update or add frontend tests when page behavior, routing, or store behavior changes.
- Run relevant tests after making changes.

Useful existing commands:

- backend build: `dotnet build backend/backend.csproj`
- backend tests: `dotnet test backend.Tests/backend.Tests.csproj`
- frontend lint: `cd frontend && npm run lint`
- frontend tests: `cd frontend && npm run test`
- frontend build: `cd frontend && npm run build`

## Deployment and Environment Rules

- Follow the current deployment structure in `.github/workflows`.
- Keep frontend hosting assumptions compatible with `frontend/vercel.json`.
- Keep backend hosting assumptions compatible with Azure App Service deployment through `.github/workflows/backend-appservice.yml`.
- Document environment variable names, but never commit their values.
- Keep CORS behavior aligned with `backend/Program.cs`, `backend/appsettings.Development.json`, and `CorsOriginNormalizer.cs`.

## Scope and Documentation Rules

- If a planned feature is not implemented in code, document it as planned only, not final.
- Update `/specs` documentation when behavior changes materially.
- Do not create or edit AI prompt evidence files unless explicitly requested.
- If a task changes implementation details, explain which files changed and how you verified the result.

## Assessment Constraints

The final three advanced requirements selected for marking are:

1. Security Measures
2. Zustand State Management
3. Theme Switching

The Security Measures requirement is supported by:

- password hashing
- server-side data validation
- ownership-based authorization

Do not claim RBAC, rate limiting, anti-CSRF protection, sanitization, Docker, Cypress, Storybook, WebSockets, multiplayer, caching, performance testing, logging, or metrics unless they are genuinely implemented later.

Keep the README advanced-features section aligned with the actual implementation.
