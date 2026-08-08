# Design Decisions

## Decision 1

### Decision

Build JobQuest as a gamified job application tracker.

### Context

The original planning draft positioned the project around the MSA gamification theme while solving a practical job-search management problem.

### Options considered

- build a different gamified product concept
- build a plain application tracker without strong gamification
- build JobQuest as a gamified job-search tool

### Final choice

The repository implements JobQuest as a gamified job application tracker.

### Reason

The planning draft explicitly connected the project to the gamification theme and to the needs of students and graduates.

### Consequences

- the project required separate rule handling for points, levels, streaks, achievements, and weekly goals
- business rules became more important than a simple CRUD-only implementation

## Decision 2

### Decision

Use simple username/password authentication backed by JWT bearer tokens.

### Context

The planning draft proposed username/password authentication and said JWT was preferred if feasible.

### Options considered

- session-style authentication
- JWT bearer authentication

### Final choice

JWT bearer authentication was implemented.

### Reason

The project intentionally used simple username and password authentication to keep the assessment scope manageable while still providing realistic account protection. JWT was selected because the React frontend and .NET backend are deployed separately, and bearer tokens provide a straightforward way to authenticate protected REST API requests.

### Consequences

- the frontend persists session data and attaches bearer tokens on requests
- the backend validates issuer, audience, signing key, and lifetime in `Program.cs`
- ownership checks depend on claims extracted from the token

## Decision 3

### Decision

Store domain data in PostgreSQL with an explicit relational model.

### Context

The planning draft described a multi-user relational design with users, job applications, progress, achievements, and user achievements.

### Options considered

- a simpler non-relational or ad hoc storage design
- a relational PostgreSQL design through EF Core

### Final choice

The final implementation uses PostgreSQL through EF Core with dedicated tables for users, job applications, progress, achievements, and unlock records.

### Reason

The planning draft expected relational, user-specific data separation. The final code follows that plan directly.

### Consequences

- multi-user ownership is explicit in the schema
- progress and achievements can be queried independently
- migrations are part of the repository and must stay consistent with model changes

## Decision 4

### Decision

Separate CRUD operations, gamification updates, progress aggregation, and achievement presentation into focused backend responsibilities.

### Context

The project needed application CRUD, status-based gamification updates, user-level progress summaries, and achievement presentation without concentrating every concern inside one controller path.

### Options considered

- keep application CRUD, progress summaries, and achievement presentation in one controller-oriented flow
- separate CRUD, gamification side effects, progress aggregation, and achievement presentation into focused backend responsibilities

### Final choice

The final backend separates responsibilities across `JobApplicationsController`, `GamificationService`, `ProgressService`, `AchievementsController`, and helper rule classes such as `GamificationRules` and `JobApplicationStatusRules`.

### Reason

Separating these responsibilities keeps the controllers easier to understand and prevents application CRUD, gamification updates, progress aggregation, and achievement presentation from becoming tightly coupled. It also makes each area easier to test and maintain independently.

### Consequences

- controller complexity is reduced because CRUD, scoring side effects, and summary reads are not all implemented in one action flow
- read and update responsibilities are clearer across `JobApplicationsController`, `ProgressService`, and `AchievementsController`
- concerns can be tested independently through controller, service, helper, and integration tests
- progress and achievement logic is easier to maintain without rewriting the main CRUD path

## Decision 5

### Decision

Use explicit status transition rules and cumulative reward logic.

### Context

The planning draft emphasized preventing repeated point farming from status changes.

### Options considered

- allow free-form status edits and patch points loosely
- encode explicit forward-only transitions and reward logic in helper/service code

### Final choice

The final implementation uses `JobApplicationStatusRules` and `GamificationRules` to define forward-only transitions, terminal states, cumulative create rewards, and skipped-stage update rewards.

### Reason

The planning draft explicitly called out the need to avoid repeated point farming.

### Consequences

- backwards transitions are blocked
- same-status edits do not award duplicate points
- skipped stages can still award cumulative points when a user jumps forward legitimately

## Decision 6

### Decision

Use Zustand for application state rather than passing data deeply through components.

### Context

The original plan selected Zustand as one of the advanced requirements.

### Options considered

- local page state only
- a heavier state-management approach
- Zustand stores for shared app state

### Final choice

The frontend uses multiple Zustand stores for auth, applications, progress, and achievements.

### Reason

The planning draft explicitly said Zustand would help manage shared state such as authentication, dashboard data, and filters.

### Consequences

- page modules can load and reuse shared state consistently
- auth cleanup can reset related stores centrally
- frontend services and stores must remain aligned with backend DTOs

## Decision 7

### Decision

Implement theme switching as a real user-facing feature.

### Context

Theme switching was selected in the original plan as one of the three advanced requirements.

### Options considered

- no theme switching
- a purely visual theme mock without persisted preference
- a persisted light/dark theme toggle

### Final choice

The final implementation uses a persisted light/dark theme toggle across the main frontend pages.

### Reason

The planning draft identified theme switching as an advanced requirement and a user-experience enhancement.

### Consequences

- theme logic is shared through `useDashboardTheme.ts`
- styling changes rely on a body data attribute and CSS variants

## Decision 8

### Decision

Keep the final advanced-feature scope focused instead of adding unrelated extras.

### Context

The planning draft explicitly told the build agent not to overcomplicate the project with Docker, WebSockets, Storybook, Cypress, or multiplayer unless requested later.

### Options considered

- add more advanced technologies to broaden the feature list
- keep scope focused on the selected top three advanced requirements

### Final choice

The final repository stays focused on the selected top three advanced requirements: Security Measures, Zustand State Management, and Theme Switching. Optional advanced features outside the selected top three were not added to the final scope.

### Reason

The planning draft emphasized a clear and realistic scope for the assessment.

### Consequences

- the implementation is more coherent around the chosen advanced features
- optional advanced features outside the selected top three are not part of the shipped implementation

## Decision 9

### Decision

Deploy the frontend to Vercel, the backend to Azure App Service, and the production database to Azure Database for PostgreSQL Flexible Server.

### Context

The original planning draft considered multiple possible frontend, backend, and database hosting providers before the final production platforms were chosen.

### Options considered

- Vercel or Netlify for the frontend
- Render, Railway, or Azure App Service for the backend
- different PostgreSQL hosting providers

### Final choice

- Frontend: Vercel
- Backend: Azure App Service
- Database: Azure Database for PostgreSQL Flexible Server

### Reason

The Vite frontend is suitable for Vercel static SPA hosting, Azure App Service supports the .NET backend, the Azure backend integrates with the existing GitHub Actions deployment workflow, Azure Database for PostgreSQL is compatible with EF Core and Npgsql, and secrets plus connection details remain in environment configuration rather than source control.

### Consequences

- `VITE_API_BASE_URL` points the deployed frontend at `https://jobquest-api-shuo-g6ana9d9avagdafg.australiaeast-01.azurewebsites.net`
- production CORS must allow the exact Vercel origin `https://jobquest-shuo.vercel.app`
- backend deployment is automated through GitHub Actions
- production configuration remains environment-variable driven
- database migrations are applied separately rather than automatically at startup
- the final public deployment uses `https://jobquest-shuo.vercel.app/` for the frontend and `https://jobquest-api-shuo-g6ana9d9avagdafg.australiaeast-01.azurewebsites.net` for the backend

## Decision 10

### Decision

Keep Progress as the dedicated gamification page and avoid a separate Profile route.

### Context

The original planning draft proposed a `/profile` page, but the final routed app does not include one and the implemented authenticated pages already expose progress metrics together with signed-in user information.

### Options considered

- keep both Profile and Progress pages
- merge progress information into Profile
- keep Progress as the dedicated gamification page and expose basic account information through the signed-in user area instead of a separate Profile route

### Final choice

Keep Progress as the dedicated gamification page and provide basic account information through the signed-in user area without a separate Profile route.

### Reason

A separate Profile page would duplicate information already shown in the current authenticated UI. Weekly goal, points, level, and streak belong naturally on Progress, while basic account information is already available through the signed-in user area. Removing the duplicate page simplifies navigation and avoids repeated content.

### Consequences

- there is no `/profile` route in the final router
- Progress remains the main gamification-information page
- account details remain available without adding another main navigation destination

## Decision 11

### Decision

Reuse one routed application form page for both creating and editing job applications.

### Context

The original plan proposed separate add and edit pages, but both workflows require nearly the same fields, validation, responsive layout, status handling, and API-related behavior.

### Options considered

- build independent add and edit page components
- create two route pages that share a separate form component
- use one routed page that switches between create and edit modes

### Final choice

`ApplicationsPage.tsx` handles both:

- `/applications/new`
- `/applications/:applicationId`

### Reason

Using one page avoids duplicated form state, field validation, status handling, API error handling, and responsive layout code while retaining separate routes for the two user flows.

### Consequences

- the current route determines create or edit mode
- application data must be loaded when editing
- draft and selected-application state must be reset correctly
- form changes remain consistent across both create and edit flows
