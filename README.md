# JobQuest

JobQuest is a full-stack job application tracker built for MSA 2026 Phase 2. It helps users manage applications across different stages of the job-search process while making progress visible through gamification features such as points, levels, streaks, achievements, and weekly goals.

## Live Links

- Application: https://jobquest-shuo.vercel.app/
- Backend API: https://jobquest-api-shuo-g6ana9d9avagdafg.australiaeast-01.azurewebsites.net
- Scalar API docs: https://jobquest-api-shuo-g6ana9d9avagdafg.australiaeast-01.azurewebsites.net/scalar/

## Theme: Gamification

JobQuest applies game-like progression to a non-game workflow: managing job applications. Users earn points for meaningful application activity, move through level thresholds, build streaks through consistent use, unlock achievements at milestones, and track weekly goals and weekly progress.

These mechanics make progress visible even before a user reaches an interview or offer. Instead of treating the job search as a sequence of isolated outcomes, the application rewards steady effort and helps users see momentum over time.

## Features

- User registration and login with JWT authentication
- Protected routes and user-specific data isolation
- Create, view, update, and delete job applications
- Forward-only job application status transition rules
- Dashboard summary for applications, progress, and gamification data
- Weekly goal editing and weekly progress tracking
- Achievement list with per-user unlock state
- Light and dark theme support
- Frontend and backend automated tests

## Features Worth Highlighting

- Gamification is connected directly to application actions rather than being a separate display layer. Creating or advancing an application can award points, update levels, extend streaks, and unlock achievements through backend rules.
- Application status changes are controlled by explicit forward-only transition rules, and progression logic is designed to avoid repeated reward exploitation. This prevents invalid backwards movement such as moving from `Interview` back to `Applied`, blocks duplicate progression from same-status edits, and only grants follow-up rewards once when the follow-up condition is first met.
- Weekly goal tracking gives the project a second kind of progress signal beyond total points. Users can see both long-term progression and short-term weekly consistency.
- The application is built as a multi-user system with authenticated, user-scoped data access. Job applications, progress, and achievements are queried and returned for the signed-in user only.

## Advanced Requirements

Only the following three advanced requirements are submitted for marking:

- [x] Security Measures
- [x] Zustand State Management
- [x] Theme Switching

### Security Measures

Security matters in JobQuest because the application stores account credentials and private job-search records. JobQuest implements the following two security measures for this advanced requirement.

Password hashing:
Passwords are not stored in plaintext. During registration, the backend hashes each password before saving it by using ASP.NET Core's built-in `PasswordHasher<ApplicationUser>`, and login verifies the submitted password against the stored hash. This means the original plaintext password is never written to the database.

Data validation:
Server-side validation is applied to request DTOs so invalid input does not rely on frontend checks alone. The backend uses validation attributes such as `Required`, `StringLength`, `Url`, and `EnumDataType`, plus custom `IValidatableObject` rules for job application requests. Because the API controllers use `[ApiController]`, invalid requests are rejected before they reach the main application logic or persistence layer.

The project also uses JWT authentication and user-scoped data access for protected endpoints, but it does not claim RBAC, refresh tokens, rate limiting, or anti-CSRF protections that are not implemented in the repository.

### Zustand State Management

Zustand is used for shared frontend state that needs to stay consistent across routes and API calls. The current implementation includes dedicated stores for authentication, job applications, progress, and achievements.

This is useful in JobQuest because session state, selected application state, progress summaries, weekly goal state, and achievement data all need to be reused across different screens without pushing props through many layers. The auth store also coordinates signed-out resets for the other domain stores when a session expires or becomes unauthorized.

### Theme Switching

JobQuest supports both light and dark themes. Theme state is managed in a dedicated frontend hook and applied through `document.body.dataset.dashboardTheme` so the UI can respond consistently across pages.

The selected theme is persisted in `localStorage`, which means the user's preference is restored on later visits instead of resetting every time the app reloads.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- Axios
- Vitest and React Testing Library

### Backend

- ASP.NET Core Web API on .NET 10
- Entity Framework Core
- PostgreSQL
- JWT bearer authentication
- Scalar OpenAPI reference
- xUnit

## Repository Structure

```text
.
|-- backend/          ASP.NET Core API, EF Core models, controllers, services
|-- backend.Tests/    xUnit unit and integration tests
|-- frontend/         React + TypeScript single-page application
|-- specs/            project documentation and design notes
```

## Core API Areas

- `/api/auth` for registration, login, and current-user lookup
- `/api/jobapplications` for authenticated CRUD operations
- `/api/progress` for progress, summary, weekly goal, and weekly goal progress
- `/api/achievements` for achievement listing and unlock state

## Authentication and Security

- Passwords are hashed before storage with ASP.NET Core password hashing.
- JWT bearer authentication protects signed-in API access.
- Protected controllers scope data access to the authenticated user.
- DTO validation attributes and request validation reject invalid payloads server-side.

This repository does not claim unsupported features such as RBAC, refresh tokens, rate limiting, or anti-CSRF protections.

## Gamification Rules

- Creating a job application awards base creation points.
- Progressing to rewarded statuses can award additional points.
- Level thresholds increase at higher total point values.
- Streaks increase when the user records activity on consecutive days.
- Achievements unlock for milestones such as first application, streak progress, interview progress, and offer progress.
- Weekly goals and weekly progress provide a short-term consistency target alongside long-term progression.

Status transitions are intentionally controlled. Backwards transitions are rejected, while valid forward jumps such as `Saved` to `Interview` are allowed and scored according to the backend rules.

## Testing

The project includes frontend page and component tests using Vitest and React Testing Library, together with backend DTO validation, controller, service, and HTTP integration tests using xUnit.

### Backend

```bash
dotnet build backend/backend.csproj
dotnet test backend.Tests/backend.Tests.csproj
```

### Frontend

```bash
cd frontend
npm run lint
npm run test
npm run build
```

## Deployment

### Frontend

- Hosted on Vercel
- SPA rewrites configured in `frontend/vercel.json`

### Backend

- Hosted on Azure App Service
- Deployment workflow in `.github/workflows/backend-appservice.yml`

### Database

- Azure Database for PostgreSQL Flexible Server in production

## CI

The CI workflow is defined in `.github/workflows/ci.yml`.

It validates:

- backend restore, build, and tests
- frontend install, tests, lint, and build

The workflow runs on pushes to `dev` and pull requests targeting `main`.

## Local Development

### Prerequisites

- .NET 10 SDK
- Node.js 22 or later
- npm
- PostgreSQL

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd MSA2026-Phase2-JobQuest
cd frontend && npm install
```

### 2. Configure the backend

The backend requires a PostgreSQL connection string and JWT settings.

Required backend configuration:

- `ConnectionStrings__DefaultConnection`
- `Jwt__Key`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__ExpiryMinutes`
- `Cors__AllowedOrigins`

Example using `dotnet user-secrets` from the `backend/` directory:

```bash
cd backend
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=jobquest;Username=postgres;Password=postgres"
dotnet user-secrets set "Jwt:Key" "replace-with-a-long-random-secret-key"
dotnet user-secrets set "Jwt:Issuer" "JobQuestApi"
dotnet user-secrets set "Jwt:Audience" "JobQuestFrontend"
dotnet user-secrets set "Jwt:ExpiryMinutes" "120"
dotnet user-secrets set "Cors:AllowedOrigins:0" "http://localhost:5173"
dotnet user-secrets set "Cors:AllowedOrigins:1" "http://127.0.0.1:5173"
```

Development CORS defaults already include:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5174`

### 3. Apply database migrations

```bash
dotnet ef database update --project backend
```

### 4. Run the backend

```bash
dotnet run --project backend/backend.csproj
```

### 5. Run the frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend uses `VITE_API_BASE_URL` and falls back to `http://localhost:5065/api` if the variable is not set.

If your backend runs on a different URL, create `frontend/.env.local` with:

```bash
VITE_API_BASE_URL=http://localhost:5065/api
```

## Documentation

The `specs/` folder keeps the planning, design, AI-usage, and project-context evidence used during development:

- `00-project-context.md`
- `01-planning-draft.md`
- `03-architecture.md`
- `04-database-design.md`
- `07-gamification-and-business-rules.md`
- `08-ai-prompts.md`
- `09-agent-instructions.md`
- `10-design-decisions.md`

## Self Reflection

If I built JobQuest again, I would define the application status transition rules and gamification rules earlier. In this project, status behaviour affects points, streaks, achievements, progress summaries, and validation, so clarifying those rules sooner would have reduced later refinement across both the backend and frontend.

I would also finalise the page and information architecture earlier and test more complete user flows sooner. For example, the earlier concept included a separate Profile page, but once the application took shape I found that it duplicated information already shown in Progress and the signed-in navigation. I also found that AI was useful for planning, implementation suggestions, debugging, and review, but its suggestions still needed to be checked carefully against the actual repository behaviour and the MSA assessment requirements.
