# JobQuest Project Context

## Purpose

JobQuest is a gamified job application tracker for students, graduates, and junior job seekers. It allows a user to register an account, log in, and then create and manage job applications, review progress, unlock achievements, and monitor weekly goals.

This file is intended to give a future developer or AI coding agent enough project context to work safely in the repository before making changes.

## Final Technology Stack

### Frontend

- React `19.2.7`
- TypeScript `~6.0.2`
- Vite `^8.1.1`
- `react-router-dom` `^7.18.2`
- Zustand `^5.0.14`
- Axios `^1.18.1`
- Vitest `^3.2.4`
- React Testing Library `^16.3.0`

Key evidence: `frontend/package.json`, `frontend/src/App.tsx`, `frontend/src/store`, `frontend/tests`

### Backend

- ASP.NET Core Web API targeting `net10.0`
- `Microsoft.EntityFrameworkCore` `10.0.4`
- `Npgsql.EntityFrameworkCore.PostgreSQL` `10.0.3`
- `Microsoft.AspNetCore.Authentication.JwtBearer` `10.0.10`
- `Scalar.AspNetCore` `2.16.16`
- xUnit `2.9.3`

## High-Level Repository Areas

```text
README.md
backend/
backend.Tests/
frontend/
specs/
```

- `backend/`: ASP.NET Core API, EF Core data model, authentication, business rules, and controllers
- `backend.Tests/`: backend controller, service, DTO validation, and integration tests
- `frontend/`: React application, Zustand stores, API services, routing, and page tests
- `specs/`: project planning and supporting documentation

## Major Implemented Capabilities

- Username and password registration
- JWT login and protected API access
- User-specific job application CRUD
- Ownership checks so users only access their own data
- Progress summary and weekly goal tracking
- Achievement listing with unlocked state
- Gamification rules for points, levels, streaks, and achievements
- Zustand-based frontend state management
- Light and dark theme switching with persisted preference
- Frontend page tests and backend unit/integration tests
- OpenAPI and Scalar API reference in non-testing environments

## Essential Project-Wide Constraints

- Use the current API route names exactly as implemented in `backend/Controllers` and consumed by `frontend/src/services`.
- Keep frontend request and response types aligned with backend DTOs.
- Do not describe unimplemented planned features as completed. Examples include a profile page, Storybook, Docker, Cypress, WebSockets, multiplayer support, and backend rate limiting.
- User-specific data must remain protected by authentication and ownership checks.
- Continue using Scalar instead of Swagger UI for API reference.
- The frontend currently stores JWT session data in `localStorage`; any auth changes must account for the existing logout and 401-cleanup behavior.
- Progress and achievement behavior is coupled to the rules in `GamificationService.cs`, `GamificationRules.cs`, `JobApplicationStatusRules.cs`, and the related test files.

## Planned But Unimplemented Features

These appeared in the original planning material but are not part of the final implementation and should not be described as complete:

- a separate Profile page or `/profile` route
- Mantine UI as the frontend component library
- backend rate limiting as a shipped security measure
- additional tooling such as Docker, Cypress, Storybook, WebSockets, multiplayer features, caching, or metrics
