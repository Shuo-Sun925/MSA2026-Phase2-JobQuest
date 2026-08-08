# JobQuest Project Planning Draft

## 1. Project Name

JobQuest

## 2. Project Type

Full-stack web application.

## 3. Project Theme

Gamification

## 4. Project Summary

JobQuest is a gamified job application tracker designed for students, graduates, and junior job seekers.

The app helps users record, manage, and track their job applications in one place. Users can create job applications, update their application status, set follow-up dates, and view their overall job-search progress through a dashboard.

To match the gamification theme, JobQuest turns the job-search process into a more motivating experience by using points, levels, streaks, achievements, and progress tracking. Instead of only showing a list of job applications, the app rewards users for consistent job-search actions and helps them feel progress even before receiving an offer.

The project will be built with:

### Frontend

- React
- TypeScript
- Vite
- Mantine UI
- React Router
- Zustand
- Axios

### Backend

- C#
- .NET 10 Web API
- Entity Framework Core
- PostgreSQL
- Scalar API Documentation

### Authentication

- Simple username and password authentication

### Testing

- Frontend unit tests
- Backend unit tests

The assessment requires a full-stack application with a React frontend, .NET backend, EF Core, database persistence, CRUD operations, frontend and backend tests, deployment, regular Git usage, a README, a `/specs` folder, AI usage evidence, and Scalar API documentation.

## 5. Problem Statement

Job searching can become difficult to manage when users apply to many roles at the same time.

A student or graduate may need to remember:

- Which companies they applied to
- Which roles they applied for
- Which applications are still active
- Which applications reached interview stage
- Which applications were rejected
- When to follow up
- How many applications they submitted this week
- Whether they are making progress

This process can feel stressful and demotivating, especially when users receive rejections or no responses.

JobQuest solves this by giving users a structured application tracker and adding gamification features to make the process more motivating.

## 6. How JobQuest Relates to the Gamification Theme

The assignment theme is gamification. Gamification means adding game-like elements to a non-game application to improve motivation, engagement, and user experience.

JobQuest is not a game. It is a practical job application tracking tool. However, it uses gamification elements to encourage users to continue making progress in their job search.

JobQuest includes the following gamification features:

- Points: users earn points for job-search actions.
- Levels: users level up based on total points.
- Streaks: users build a streak by doing job-search activities on consecutive days.
- Achievements: users unlock badges for milestones.
- Progress tracking: users can see weekly progress, total applications, interviews, offers, and other statistics.

Examples:

- Creating a new application gives points.
- Moving an application to Interview gives extra points.
- Receiving an Offer gives a large points reward.
- Creating the first application unlocks an achievement.
- Submitting multiple applications in one week contributes to weekly progress.

This matches the assignment theme because it uses points, achievements, streaks, and progress tracking in a non-game application.

## 7. Target Users

The target users are:

- University students
- Recent graduates
- Junior developers
- Graduate programme applicants
- People applying for multiple jobs at the same time

The app is especially suitable for students and graduates because they often apply for many roles across different companies and need a simple system to track progress.

## 8. Core User Flow

1. User registers an account with username and password.
2. User logs in.
3. User sees the dashboard.
4. User creates a new job application.
5. User views all applications.
6. User updates an application status.
7. Backend updates points, level, streak, and achievements.
8. User checks dashboard progress.
9. User continues tracking applications over time.

## 9. Authentication Plan

JobQuest will use a simple username and password authentication system.

This is intentionally kept simple to avoid overcomplicating the assessment scope, while still demonstrating a realistic security feature.

### 9.1 Registration

When a user registers:

1. User enters username and password.
2. Backend validates the input.
3. Backend checks whether the username already exists.
4. Backend hashes the password.
5. Backend stores the user with the password hash in PostgreSQL.

The database will store:

- Username
- PasswordHash
- CreatedAt

The database will not store the original password.

### 9.2 Login

When a user logs in:

1. User enters username and password.
2. Backend finds the user by username.
3. Backend verifies the input password against the stored password hash.
4. If correct, backend returns a login result.
5. Frontend stores the user session state.

For the first version, authentication can be implemented with a simple JWT token or a simple session-style token. JWT is preferred if time allows because it makes it easier to protect API endpoints.

### 9.3 Password Storage Rule

Passwords must never be stored as plain text.

Correct approach:

- Hash password before saving to database.
- Store only `PasswordHash`.
- Verify login password against `PasswordHash`.

Incorrect approach:

- Store plain password in database.
- Encrypt password after saving.
- Try to decrypt password during login.

### 9.4 Security Importance

Password hashing is important because if the database is leaked, users' original passwords should not be exposed.

This will be included in the README as one of the selected security measures.

## 10. Planned Pages

### 10.1 Login Page

Route: `/login`

Purpose: Allows an existing user to log in with username and password.

Main fields:

- Username
- Password

### 10.2 Register Page

Route: `/register`

Purpose: Allows a new user to create an account.

Main fields:

- Username
- Password
- Confirm password

### 10.3 Dashboard Page

Route: `/`

Purpose: Shows the user's job-search progress and gamification summary.

Dashboard should show:

- Total applications
- Applications this week
- Interview count
- Offer count
- Total points
- Current level
- Current streak
- Weekly goal progress
- Recent applications
- Recently unlocked achievements

### 10.4 Applications Page

Route: `/applications`

Purpose: Shows all job applications belonging to the logged-in user.

Each application card should show:

- Company name
- Job title
- Location
- Status
- Applied date
- Next follow-up date
- Notes preview

Filters:

- All
- Saved
- Applied
- Online Assessment
- Interview
- Offer
- Rejected
- Withdrawn

### 10.5 Add Application Page

Route: `/applications/new`

Purpose: Allows the user to create a new job application.

Form fields:

- Company name
- Job title
- Location
- Job link
- Status
- Applied date
- Next follow-up date
- Notes

### 10.6 Edit Application Page

Route: `/applications/:id/edit`

Purpose: Allows the user to update an existing application.

Updating an application status may trigger gamification logic.

Example:

- `Applied -> Interview`

This can award extra points and unlock achievements.

### 10.7 Achievements Page

Route: `/achievements`

Purpose: Shows all available achievements and whether they are unlocked by the logged-in user.

Example achievements:

- First Application
- Job Hunter
- Consistent Seeker
- Interview Unlocked
- Offer Hunter

### 10.8 Profile Page

Route: `/profile`

Purpose: Shows user account and progress information.

Profile page should show:

- Username
- Total points
- Current level
- Current streak
- Weekly goal
- Unlocked achievements

## 11. Frontend Structure

The frontend will be placed in the `frontend/` folder.

Recommended structure:

```text
frontend/
  package.json
  vite.config.ts
  src/
    main.tsx
    App.tsx
    pages/
      LoginPage.tsx
      RegisterPage.tsx
      DashboardPage.tsx
      ApplicationsPage.tsx
      AddApplicationPage.tsx
      EditApplicationPage.tsx
      AchievementsPage.tsx
      ProfilePage.tsx
    components/
      Navbar.tsx
      ProtectedRoute.tsx
      ApplicationCard.tsx
      ApplicationForm.tsx
      StatusBadge.tsx
      ProgressCard.tsx
      AchievementCard.tsx
      ThemeToggle.tsx
    services/
      api.ts
      authService.ts
      applicationService.ts
      progressService.ts
      achievementService.ts
    store/
      useAuthStore.ts
      useAppStore.ts
    types/
      auth.ts
      application.ts
      achievement.ts
      progress.ts
      user.ts
    tests/
      ApplicationCard.test.tsx
      StatusBadge.test.tsx
      DashboardPage.test.tsx
      ThemeToggle.test.tsx
```

Frontend responsibilities:

- Show UI pages
- Handle forms
- Call backend APIs
- Store frontend state
- Manage theme switching
- Display dashboard progress
- Display validation errors
- Protect pages that require login

## 12. Backend Structure

The backend will be placed in the `backend/` folder.

Recommended structure:

```text
backend/
  JobQuest.sln
  JobQuest.Api/
    Controllers/
      AuthController.cs
      ApplicationsController.cs
      ProgressController.cs
      AchievementsController.cs
      UsersController.cs
    Data/
      AppDbContext.cs
      DbSeeder.cs
    Models/
      User.cs
      JobApplication.cs
      UserProgress.cs
      Achievement.cs
      UserAchievement.cs
    DTOs/
      RegisterDto.cs
      LoginDto.cs
      AuthResponseDto.cs
      CreateJobApplicationDto.cs
      UpdateJobApplicationDto.cs
      JobApplicationDto.cs
      ProgressSummaryDto.cs
      AchievementDto.cs
    Services/
      AuthService.cs
      ApplicationService.cs
      GamificationService.cs
      TokenService.cs
    Program.cs
    appsettings.json
  JobQuest.Tests/
    AuthServiceTests.cs
    GamificationServiceTests.cs
    ApplicationServiceTests.cs
```

Backend responsibilities:

- Handle API requests
- Validate request data
- Authenticate users
- Hash passwords
- Protect user-specific data
- Perform CRUD operations
- Apply gamification rules
- Read and write PostgreSQL data through EF Core
- Expose Scalar API documentation
- Apply rate limiting
- Run backend unit tests

## 13. PostgreSQL Database Design

The database will use PostgreSQL.

The database is designed for multiple users from the start. Each user has their own job applications, progress, and achievements.

### 13.1 Users Table

Stores account information.

`Users`

- Id
- Username
- PasswordHash
- CreatedAt

Notes:

- Username must be unique.
- PasswordHash stores the hashed password.
- The original password is never stored.

### 13.2 JobApplications Table

Stores job application records.

`JobApplications`

- Id
- UserId
- CompanyName
- JobTitle
- Location
- JobLink
- Status
- AppliedDate
- NextFollowUpDate
- Notes
- CreatedAt
- UpdatedAt

Notes:

- Each job application belongs to one user.
- `UserId` is a foreign key to `Users`.
- Users should only access their own job applications.

### 13.3 UserProgress Table

Stores each user's gamification progress.

`UserProgress`

- Id
- UserId
- TotalPoints
- CurrentLevel
- CurrentStreak
- LastActivityDate
- WeeklyGoal
- CreatedAt
- UpdatedAt

Notes:

- Each user has one progress record.
- TotalPoints controls level calculation.
- CurrentStreak tracks consecutive job-search activity.
- WeeklyGoal is used for progress tracking.

### 13.4 Achievements Table

Stores achievement templates.

`Achievements`

- Id
- Name
- Description
- Icon
- ConditionType
- TargetValue
- CreatedAt

Notes:

- This table defines available achievements.
- It does not store whether a specific user has unlocked them.

### 13.5 UserAchievements Table

Stores which achievements each user has unlocked.

`UserAchievements`

- Id
- UserId
- AchievementId
- UnlockedAt

Notes:

- This table connects users and achievements.
- Different users can unlock different achievements.

## 14. Database Relationships

- One User has many JobApplications.
- One User has one UserProgress.
- One User has many UserAchievements.
- One Achievement has many UserAchievements.

Simple relationship view:

```text
Users
 ├── JobApplications
 ├── UserProgress
 └── UserAchievements
     └── Achievements
```

This design makes sure all user data is separated.

For example:

- User A can only see User A's applications.
- User B can only see User B's applications.
- User A and User B can have different points, streaks, and achievements.

## 15. Job Application Statuses

Each application will have one status.

Planned statuses:

- Saved
- Applied
- OnlineAssessment
- Interview
- Offer
- Rejected
- Withdrawn

Meanings:

- Saved: the user found the job but has not applied yet.
- Applied: the user has submitted the application.
- OnlineAssessment: the user received an online assessment.
- Interview: the user reached interview stage.
- Offer: the user received an offer.
- Rejected: the application was unsuccessful.
- Withdrawn: the user decided to stop the application.

## 16. Gamification Rules

### 16.1 Points System

Planned points:

- Create a new application: `+10` points
- Move status to Applied: `+10` points
- Move status to OnlineAssessment: `+15` points
- Move status to Interview: `+30` points
- Move status to Offer: `+100` points
- Add a follow-up date: `+5` points

To reduce point farming, points should only be awarded when the application moves forward to a higher-value status.

Status ranking:

- Saved = 0
- Applied = 1
- OnlineAssessment = 2
- Interview = 3
- Offer = 4
- Rejected = no extra progress points
- Withdrawn = no extra progress points

### 16.2 Level System

Levels are calculated from total points.

- Level 1: `0 - 49` points
- Level 2: `50 - 99` points
- Level 3: `100 - 199` points
- Level 4: `200 - 349` points
- Level 5: `350+` points

### 16.3 Streak System

A streak represents consecutive days of job-search activity.

Activities that count toward streak:

- Creating a new application
- Updating an application status
- Adding a follow-up date

Streak logic:

- If the user has activity today and last activity was yesterday, `CurrentStreak` increases by 1.
- If the user has activity today and last activity was already today, `CurrentStreak` stays the same.
- If the last activity was earlier than yesterday, `CurrentStreak` resets to 1.

### 16.4 Achievement System

Planned achievements:

- First Application: create 1 application
- Job Hunter: create 5 applications
- Consistent Seeker: reach a 3-day streak
- Interview Unlocked: have 1 application with Interview status
- Offer Hunter: have 1 application with Offer status

Achievements are stored as templates in `Achievements`, while each user's unlocked achievements are stored in `UserAchievements`.

## 17. API Design

The backend will expose REST API endpoints.

Authenticated endpoints should only return data for the logged-in user.

### 17.1 Auth API

`POST /api/auth/register`

Creates a new user account.

Request:

```json
{
  "username": "stephen",
  "password": "Password123!"
}
```

Response:

```json
{
  "userId": 1,
  "username": "stephen",
  "token": "jwt-token-here"
}
```

`POST /api/auth/login`

Logs in an existing user.

Request:

```json
{
  "username": "stephen",
  "password": "Password123!"
}
```

Response:

```json
{
  "userId": 1,
  "username": "stephen",
  "token": "jwt-token-here"
}
```

### 17.2 Applications API

- `GET /api/applications`: returns all applications for the logged-in user.
- `GET /api/applications/{id}`: returns one application if it belongs to the logged-in user.
- `POST /api/applications`: creates a new application for the logged-in user.
- `PUT /api/applications/{id}`: updates an existing application if it belongs to the logged-in user.
- `DELETE /api/applications/{id}`: deletes an application if it belongs to the logged-in user.

### 17.3 Progress API

- `GET /api/progress`: returns the logged-in user's progress.
- `GET /api/progress/summary`: returns dashboard summary data.

Example response:

```json
{
  "totalApplications": 12,
  "applicationsThisWeek": 4,
  "interviewCount": 2,
  "offerCount": 1,
  "totalPoints": 180,
  "currentLevel": 3,
  "currentStreak": 4,
  "weeklyGoal": 5
}
```

### 17.4 Achievements API

`GET /api/achievements`

Returns all achievements and whether they are unlocked by the logged-in user.

## 18. Selected Advanced Requirements

The assessment requires at least three advanced requirements. The README must clearly list the top three advanced features because only those listed features will be marked.

For JobQuest, the selected top three advanced requirements are:

1. Security measures
2. Zustand state management
3. Theme switching

### 18.1 Advanced Feature 1: Security Measures

This project will implement at least two security measures:

- Password hashing
- Data validation
- Rate limiting

Although the requirement asks for a minimum of two security measures, this project plans to implement three if time allows.

#### Password Hashing

User passwords will be hashed before being stored in the database.

The database stores:

- `PasswordHash`

The database does not store:

- Plain text password

This is important because if the database is exposed, user passwords should not be readable.

#### Data Validation

The backend will validate incoming request data before saving it.

Examples:

- Username is required.
- Password must meet minimum length requirements.
- Company name is required.
- Job title is required.
- Status must be valid.
- Job link must be a valid URL.
- Notes must not exceed the maximum length.

This prevents invalid data from entering the database.

#### Rate Limiting

The backend will limit excessive API requests.

Example:

- Limit each client to a fixed number of requests per minute.

This helps protect the API from spam and abuse.

### 18.2 Advanced Feature 2: Zustand State Management

Zustand will be used to manage shared frontend state.

Examples:

- Authentication state
- Logged-in user information
- Theme mode
- Selected application status filter
- Dashboard progress state

This keeps frontend state organised and avoids passing data through many component layers.

### 18.3 Advanced Feature 3: Theme Switching

JobQuest will support light and dark mode.

The selected theme will be stored in frontend state and local storage, so the user's preference remains after refresh.

This improves user experience and gives the app a more polished feel.

## 19. Interesting Features Worth Highlighting to the Marker

The README should highlight the following features:

- Gamified job-search workflow
- Points, levels, streaks, and achievements
- Real account registration and login
- Password hashing before database storage
- User-specific job application data
- PostgreSQL relational database design
- Dashboard with progress statistics
- Status-based application tracking
- Responsive UI using Mantine
- Light and dark theme switching
- Zustand state management
- Scalar API documentation

Suggested README wording:

> JobQuest is unique because it applies gamification to the stressful and repetitive process of graduate job searching. Instead of being only a CRUD tracker, it rewards users for consistent job-search behaviour through points, levels, streaks, and achievements. The app also includes simple authentication, hashed password storage, user-specific application data, and a progress dashboard to make the experience more realistic and useful.

## 20. Testing Plan

The assessment requires frontend and backend unit tests.

### 20.1 Backend Tests

Backend tests will cover:

- Password hashing and login verification
- Application creation
- Application update
- Application deletion
- Gamification points calculation
- Level calculation
- Streak update logic
- Achievement unlock logic

Planned test files:

- `AuthServiceTests.cs`
- `ApplicationServiceTests.cs`
- `GamificationServiceTests.cs`

### 20.2 Frontend Tests

Frontend tests will cover:

- Login form rendering
- Application card rendering
- Status badge rendering
- Dashboard progress display
- Theme toggle behaviour

Planned test files:

- `LoginPage.test.tsx`
- `ApplicationCard.test.tsx`
- `StatusBadge.test.tsx`
- `DashboardPage.test.tsx`
- `ThemeToggle.test.tsx`

## 21. Deployment Plan

The README must include deployment links.

Planned deployment:

- Frontend: Vercel or Netlify
- Backend: Render, Railway, or Azure App Service
- Database: Neon PostgreSQL, Supabase PostgreSQL, Render PostgreSQL, or Railway PostgreSQL

Recommended simple deployment setup:

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

README placeholders:

- Frontend deployment: `[Add frontend link here]`
- Backend deployment: `[Add backend link here]`
- Scalar API docs: `[Add Scalar API docs link here]`

## 22. README Required Content

The README must contain the following sections.

### 22.1 Deployment Links

```md
## Deployment
Frontend: [link here]
Backend: [link here]
Scalar API Documentation: [link here]
```

### 22.2 Brief Introduction

```md
## Project Introduction
JobQuest is a gamified job application tracker for students and graduate job seekers. It helps users manage job applications, track progress across hiring stages, and stay motivated through points, levels, streaks, achievements, and dashboard progress tracking.
```

### 22.3 Theme Explanation

```md
## Theme: Gamification
JobQuest relates to the gamification theme by applying game-like elements to the job-search process. Users earn points for creating applications and progressing through hiring stages. They can level up, build streaks through consistent activity, unlock achievements, and track weekly progress through a dashboard.
```

### 22.4 Interesting Features

```md
## Features Worth Highlighting
- Gamified job application tracking workflow
- Points, levels, streaks, and achievements
- User registration and login
- Password hashing before database storage
- User-specific application data
- Dashboard with progress statistics
- PostgreSQL relational database design
- Responsive UI with light and dark theme switching
- Scalar API documentation for backend endpoints
```

### 22.5 Advanced Features Checklist

```md
## Advanced Features Checklist
Only the following top three advanced features are submitted for marking:
- [x] Security measures
  - Password hashing
  - Data validation
  - Rate limiting
- [x] Zustand state management
  - Authentication state
  - Theme state
  - Application filters
  - Shared dashboard state
- [x] Theme switching
  - Light mode
  - Dark mode
  - Theme preference stored locally
```

### 22.6 Self Reflection

```md
## Self Reflection
If I were to do this project again, I would spend more time finalising the data model and authentication flow before implementation. Because the project includes user-specific data, gamification logic, and status-based progress, early design decisions strongly affect the backend structure. I would also define more edge cases at the start, such as preventing repeated point gains from changing an application status back and forth. In addition, I would create the frontend component structure earlier so that the UI remains consistent across pages. While AI tools can help generate code quickly, I would still need to carefully review the output, test the logic, and make sure it matches the project requirements.
```

## 23. `/specs` Folder Plan

The assessment requires a `/specs` folder containing `.md` files. It must show evidence of planning, design, and AI-assisted development. It must include AI prompt files, agent instructions, context and config files, and prompts used during development, not just the final code.

This section is preserved as original planning evidence. The filenames below reflect the early proposed `/specs` layout, not the final cleaned documentation set in the current repository.

Recommended `/specs` folder:

```text
specs/
  01-project-plan.md
  02-architecture.md
  03-database-design.md
  04-api-design.md
  05-authentication-plan.md
  06-gamification-rules.md
  07-ai-prompts.md
  08-agent-instructions.md
  09-design-decisions.md
  10-reflection.md
```

### 23.1 `01-project-plan.md`

Should include:

- Project name
- Project summary
- Target users
- Problem statement
- Core features
- Gamification theme explanation
- Selected advanced requirements

### 23.2 `02-architecture.md`

Should include:

- Frontend structure
- Backend structure
- How frontend communicates with backend
- How backend communicates with PostgreSQL
- High-level system flow

Example content:

> React frontend sends HTTP requests to the .NET backend using Axios. The backend validates the request, checks authentication, applies business logic, and stores or retrieves data from PostgreSQL using Entity Framework Core.

### 23.3 `03-database-design.md`

Should include:

- Database choice: PostgreSQL
- Tables
- Fields
- Relationships
- Multi-user design
- Why passwords are stored as `PasswordHash`

Tables to document:

- Users
- JobApplications
- UserProgress
- Achievements
- UserAchievements

### 23.4 `04-api-design.md`

Should include:

- Auth endpoints
- Application endpoints
- Progress endpoints
- Achievement endpoints
- Example request and response bodies
- Which endpoints require authentication

### 23.5 `05-authentication-plan.md`

Should include:

- Registration flow
- Login flow
- Password hashing flow
- Protected API endpoints
- How frontend stores login state
- How user-specific data is protected

Important note to include:

> Passwords are hashed before being saved to the database. The original password is never stored.

### 23.6 `06-gamification-rules.md`

Should include:

- Points rules
- Level rules
- Streak rules
- Achievement rules
- How to prevent repeated point farming

### 23.7 `07-ai-prompts.md`

This file should record prompts used during development.

Example prompt records:

```md
# AI Prompts

## Prompt 1: Project idea refinement
I asked AI to help compare a fitness tracker and a job application tracker for the MSA Phase 2 gamification assignment. The final decision was to build JobQuest because it is more relevant to graduate job seekers and easier to discuss in future interviews.

## Prompt 2: Database design
I asked AI to help design a PostgreSQL database schema for a gamified job application tracker with users, job applications, progress, and achievements.

## Prompt 3: Authentication planning
I asked AI how to implement simple username and password authentication in .NET, including how password hashing should work and whether passwords should be hashed before or after database storage.

## Prompt 4: API design
I asked AI to propose REST API endpoints for authentication, job application CRUD, progress summary, and achievements.

## Prompt 5: README planning
I asked AI to help create a README structure that satisfies the MSA Phase 2 submission requirements.
```

### 23.8 `08-agent-instructions.md`

This file should tell the AI coding agent how to work on the project.

Example:

```md
# Agent Instructions

You are helping build JobQuest, a gamified job application tracker for the MSA Phase 2 Software Stream assessment.

Important requirements:
- Use React with TypeScript for the frontend.
- Use C# .NET 10 Web API for the backend.
- Use Entity Framework Core.
- Use PostgreSQL for the database.
- Use Scalar API documentation instead of Swagger UI.
- Implement frontend and backend unit tests.
- Implement authentication with username and password.
- Hash passwords before storing them in the database.
- Use Zustand for frontend state management.
- Implement light/dark theme switching.
- Implement security measures: password hashing, data validation, and rate limiting.
- Keep code simple, readable, and easy to explain.
- Do not add unnecessary advanced features unless requested.
- Keep the README updated with deployment links, theme explanation, highlighted features, advanced features checklist, and self-reflection.
- Record important prompts and design decisions in the `/specs` folder.
```

### 23.9 `09-design-decisions.md`

Should include important decisions:

- Chose JobQuest instead of a fitness tracker because it is more relevant to graduate job seekers.
- Chose PostgreSQL because the data is relational and user-specific.
- Chose simple username and password authentication to keep scope manageable.
- Chose password hashing because storing plain passwords is unsafe.
- Chose Zustand for simple shared frontend state.
- Chose Mantine UI to build a polished responsive interface faster.
- Chose security measures as one advanced requirement because authentication and user data require protection.

### 23.10 `10-reflection.md`

This file should capture what worked, what could be improved, and what would be done differently in a future iteration.