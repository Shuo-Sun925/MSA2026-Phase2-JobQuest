# AI-Assisted Development Prompts

## Purpose

This file records representative prompts that I used while planning, implementing, testing, deploying, reviewing, and documenting JobQuest for the Microsoft Student Accelerator 2026 Phase 2 Software Stream.

It is a curated record rather than a complete transcript of every AI conversation. Repeated follow-up questions, screenshots containing partial code, and minor wording changes have been omitted where they did not provide additional evidence of the development process.

The prompts are grouped by development stage to show how AI supported the project from the initial plan through to the final submission audit.

AI-generated output was not treated as the source of truth. I reviewed proposed changes against the current source code, tests, migrations, configuration, deployed application, and assessment requirements before accepting them.

## AI Tools Used

### ChatGPT

I used ChatGPT to:

- turn the original project idea into a practical development plan
- explain unfamiliar concepts in .NET, Entity Framework Core, PostgreSQL, JWT authentication, Zustand, Azure, Vercel, and GitHub Actions
- decide the order in which features should be implemented
- review models, DTOs, controllers, services, stores, routes, tests, and UI behaviour
- discuss business rules and edge cases
- prepare manual and automated test plans
- troubleshoot local-development and production-deployment issues
- improve responsive layouts and user flows
- audit the completed repository against the assessment requirements
- review and improve the final documentation

### GitHub Copilot

I used GitHub Copilot inside the repository for focused code and documentation tasks.

The prompts normally required Copilot to:

- inspect the existing implementation before making changes
- treat the committed code and tests as the source of truth
- preserve the existing architecture
- avoid unrelated features or large-scale rewrites
- run the relevant tests and builds
- report exactly which files were changed
- identify any assumptions or remaining uncertainty

I also used Copilot to review pull requests and perform repository-wide factual audits. I manually reviewed its suggestions before accepting them.

## General AI-Assisted Workflow

My normal workflow was:

1. Describe the current state of the project.
2. Define one focused development goal.
3. Ask the AI to inspect the existing files before editing.
4. Request a limited and clearly scoped change.
5. Review the generated code or documentation.
6. Run the relevant build, tests, linting, and manual checks.
7. Correct inaccurate assumptions or overly broad changes.
8. Commit the verified milestone with a focused commit message.

This approach was particularly important for authentication, data ownership, status transitions, gamification rules, frontend state synchronisation, and deployment configuration.

## Initial Planning and Repository Structure

### Representative Prompt: Expanding the Project Structure

“Expand my project structure to the proposed structure. Only create the required empty folders and files. Do not add code to every file yet.

Doc9 contains the planning draft for this project. The image shows my current template, which is still very basic. I want to improve the initial structure, but it should still remain an initial setup.

Do models correspond to database tables? I have five planned tables, so why do I currently only have three model classes?”

How it was used:

This discussion helped establish the relationship between EF Core models and database tables. It also helped organise the repository into frontend, backend, backend.Tests, .github, and specs areas.

### Representative Prompt: Choosing a Cloud Database

“My database will use PostgreSQL. Because the project must be deployed, I want to use a cloud database from the beginning.

Are there free options? Between AWS and Azure, which one is easier and more suitable for this project?”

How it was used:

This discussion helped compare available managed database services. The final production database was hosted on Azure Database for PostgreSQL Flexible Server.

### Representative Prompt: Environment Variables and Secrets

“What are user secrets? Can I use a .env file?

Would using .env make deployment easier?”

How it was used:

This prompted a clearer separation between local development configuration, .env files, .NET user secrets, GitHub repository secrets, and Azure App Service environment settings. Secret values were kept out of the repository.

## Database Design and Entity Framework Core

### Representative Prompt: Creating the Final Entities

“I have completed the backend database connection, installed the dotnet-ef command-line tool, and configured ApplicationDbContext.

I now need to complete these entities:

ApplicationUser
JobApplication
UserProgress
Achievement
UserAchievement

I also need to create the migration. My goal for today is to see all of the tables in PostgreSQL.”

How it was used:

This prompt supported the creation of the final relational data model and the initial EF Core migration.

### Representative Prompt: Checking the Initial Migration

“This is my current InitialCreate migration. Please check whether there are any problems.”

How it was used:

The generated migration was reviewed against the model classes, keys, foreign keys, constraints, relationships, and expected fields before it was applied.

### Representative Prompt: Understanding Timestamp Defaults

“Please check the behaviour of DateTime.UtcNow defaults.

For example:

public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

This means the default is generated by the C# application rather than automatically by PostgreSQL.

However:

public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

will not automatically change every time the entity is updated.

Please check whether UpdatedAt is correctly changed when a JobApplication is edited.”

How it was used:

This discussion clarified the difference between entity initialisers and database defaults. The update behaviour was checked to ensure that application edits update the timestamp used by frontend sorting.

## Authentication and Security

### Representative Prompt: Moving from Authentication to the Next Stage

“My authentication API now passes all tests, and I can see the hashed password in pgAdmin. What should I work on next?”

How it was used:

The project moved from authentication to user-owned Job Application CRUD.

### Representative Prompt: Checking Whether a JWT Key Can Be Committed

“My development configuration currently contains a JWT key, issuer, audience, and expiry time.

Does the JWT key need to remain secret? Can it be uploaded directly to GitHub?”

How it was used:

This reinforced that JWT signing keys and production credentials must not be committed. Production values were moved to environment configuration.

### Representative Prompt: Separating Auth Service and Zustand Responsibilities

“Should this code be placed in frontend/src/services/authService.ts, while the actual frontend auth state is placed in a Zustand store?

Would it be more reasonable for authService to handle API requests and localStorage, while useAuthStore manages the frontend authentication state?

Am I currently checking whether the token has expired?

Should I add getStoredSession?

I should not save the token separately and then save it again inside the session object.”

How it was used:

This helped define the final separation between the authentication service, local session persistence, Axios token attachment, and the Zustand authentication store.

### Representative Prompt: Expired-Token Handling

“Please fix a bug where the page should automatically return to the login page when the token expires.

For example, if a user leaves the website open and returns one day later, the application should not wait until the user refreshes the page before logging them out.”

How it was used:

The frontend session logic was improved to check token expiry, schedule logout, react to 401 responses, and clear protected application state.

## Job Application API and Ownership

### Representative Prompt: Planning the API Development Order

“I have completed the database part. I am now starting the API.

First, list all of the APIs I need and give me the correct development order.”

How it was used:

The implementation order became:

- Authentication
- Job Application CRUD
- Gamification
- Progress
- Achievements
- Automated testing
- Frontend integration

### Representative Prompt: Implementing Job Application DTOs and CRUD

“These files are currently empty:

DTOs/JobApplications/JobApplicationResponse.cs
DTOs/JobApplications/CreateJobApplicationRequest.cs
DTOs/JobApplications/UpdateJobApplicationRequest.cs

Based on my actual model fields, help me complete the following step by step:

DTO validation
Response mapping
Current-user ID extraction
GET all
GET by ID
POST
PUT
DELETE
Scalar testing
User-data-isolation testing”

How it was used:

This supported validated DTOs, response mapping, ownership-scoped queries, CRUD endpoints, and manual API verification through Scalar.

### Representative Prompt: Defining AppliedDate and Weekly Progress

“Weekly application progress should be calculated using AppliedDate.

Saved only means that the user has stored the job details and has not applied yet, so Saved applications should not count toward the weekly goal.

When a user records an application that has already been submitted, AppliedDate should default to today, but the user should be allowed to change it.

If an application is in Applied or a later stage and no AppliedDate is supplied, the backend can use today’s date.”

How it was used:

AppliedDate became the source of truth for weekly progress instead of CreatedAt, UpdatedAt, or the current status alone.

### Representative Prompt: Explicit Status-Transition Rules

“I do not want users to move a normal application status backwards.

Offer, Rejected, and Withdrawn should be terminal states.

The frontend should show a confirmation before saving a status change.

The backend must validate legal transitions.

Weekly Goal should use AppliedDate.

The transition rules must be explicit rather than based only on comparing enum values.

Valid stage skipping should be allowed, for example:

Applied to Interview
Applied to Offer”

How it was used:

This became one of the most important business-design decisions. The final backend uses explicit transition rules rather than relying on enum ordering.

## Gamification Service

### Representative Prompt: Beginning the Gamification Stage

“I am continuing development of my MSA 2026 Phase 2 JobQuest project. Please guide me step by step through the remaining backend functionality.

The next stage is GamificationService.

It needs to handle:

Points
Level
Streak
Achievements

GamificationService should be called when a JobApplication is created or updated.

It must prevent duplicate rewards.

Planned points:

Create an application: +10
Reach Applied: +10
Reach OnlineAssessment: +15
Reach Interview: +30
Reach Offer: +100
Add the first follow-up date: +5

Level rules:

Level 1: 0–49
Level 2: 50–99
Level 3: 100–199
Level 4: 200–349
Level 5: 350+

Streak rules:

Valid activity includes creating an application, making a legal forward status update, or adding the first follow-up date.

If LastActivityDate is today, the streak does not increase again.

If it was yesterday, the streak increases by one.

If it is older or null, the streak becomes one.

Achievements:

First Application
Job Hunter
Consistent Seeker
Interview Unlocked
Offer Hunter

Do not provide all of the code at once. First inspect my existing models and related files, then implement it in smaller steps.”

How it was used:

This was the main prompt for designing and implementing the gamification service.

### Representative Prompt: Cumulative Status Rewards

“I have decided to use cumulative stage points.

Creating an application directly at Interview should award:

Create application: +10
Applied: +10
OnlineAssessment: +15
Interview: +30
Total: +65

Creating directly at Offer should award:

Create application: +10
Applied: +10
OnlineAssessment: +15
Interview: +30
Offer: +100
Total: +165

For a skipped transition such as Applied to Interview, the user should receive:

OnlineAssessment: +15
Interview: +30
Total: +45

This means applications at the same final stage receive consistent stage points, and users do not need to update every stage individually just to earn the full reward.

Rejected and Withdrawn should not provide stage points.

Please check whether this logic has any problems. If it is sound, implement this design.”

How it was used:

This established cumulative rewards for direct creation and skipped forward transitions.

### Representative Prompt: Preventing Repeated Rewards

“Same-status edits must not award the same stage points again.

The follow-up reward must only be available once per application.

Rejected and Withdrawn do not provide stage points.

Multiple actions on the same day must not repeatedly increase the streak.

Achievement unlocks must not create duplicate UserAchievement records.”

How it was used:

The final implementation uses explicit transitions, same-status checks, HasEarnedFollowUpPoints, date-based streak logic, and duplicate achievement protection.

## Progress, Achievements, and Weekly Goal

### Representative Prompt: Implementing Progress and Achievements APIs

“The next stage is Progress and Achievements.

Implement:

GET /api/progress
GET /api/progress/summary
GET /api/achievements

The weekly-goal endpoint should eventually be moved from JobApplicationsController to ProgressController.

The progress summary should include:

totalApplications
applicationsThisWeek
savedCount
appliedCount
onlineAssessmentCount
interviewCount
offerCount
rejectedCount
withdrawnCount
totalPoints
currentLevel
currentStreak
lastActivityDate
weeklyGoal
weeklyGoalProgress
remainingApplications
isGoalMet

The Achievement API should return:

achievement template information
whether the current user has unlocked it
unlockedAt”

How it was used:

This guided the final progress read models and protected achievement endpoint.

### Representative Prompt: Removing the Separate Profile Page

“I have decided not to create a new Profile page, and I do not want to rename the existing Progress page to Profile.

Keep the Progress page because it displays weekly goal progress, total points, current level, current streak, and application statistics.

Weekly Goal belongs to progress, so the ability to update it should be placed directly on the Progress page.

Do not create:

a Profile page
avatar
bio
email settings
notification preferences
forgot-password functionality
email verification
empty preference placeholders”

How it was used:

The final application does not contain a /profile route. Progress remains the dedicated gamification page.

### Representative Prompt: Adding Weekly Goal Editing

“Add an area to the current Progress page where the user can update the Weekly Goal.

It should:

display the current weekly goal;
display the number of applications completed this week;
show text such as ‘2 of 5 applications completed’;
keep or update the progress bar;
allow the user to choose a new goal, such as 3, 5, 7, or 10;
provide a clear Save goal button;
show a loading state and prevent duplicate submission;
show success and error messages;
refresh the weekly goal and progress immediately after saving.

Add a backend endpoint similar to:

PATCH /api/progress/weekly-goal

The body should contain weeklyGoal.

The endpoint must require authentication, get the current user ID from the JWT, only update that user’s UserProgress, validate a range from 1 to 20, save the change, and return the updated progress.”

How it was used:

This produced the final protected weekly-goal update flow and its frontend integration.

## Backend Testing

### Representative Prompt: Planning Integration Tests

“Write integration tests using in-memory SQLite.

Authentication tests:

registration succeeds and returns a token;
duplicate username registration fails;
login with the correct password succeeds;
login with the wrong password fails;
unauthenticated access to a protected endpoint returns 401.

JobApplication flow:

an authenticated user can create an application;
the created application can be retrieved;
a user can only read their own application;
a user cannot update another user’s application;
a user cannot delete another user’s application.

Gamification flow:

register a user;
create an Applied application;
update it to Interview;
GET /api/progress;
confirm the points and level;
GET /api/achievements;
confirm First Application and Interview Unlocked.

Progress summary:

count applications by AppliedDate;
Saved does not count;
Applied followed by Withdrawn still counts;
another user’s data does not count.”

How it was used:

The backend integration suite was expanded around real authentication, ownership, progress, and gamification flows.

### Representative Prompt: Organising Tests by Responsibility

“Would writing tests from the beginning make the project too complicated?

Could we first design the DTOs and service methods, write tests for the core calculation logic, implement the services, create thin controllers, and then add a smaller number of controller tests?

For me, testing one functional scenario at a time and then implementing it until it passes would make the behaviour easier to understand.”

How it was used:

Tests were organised across DTO validation, service tests, controller tests, and HTTP integration tests rather than concentrating all coverage in one layer.

### Representative Prompt: Resolving Test Failures

“Running dotnet test backend.Tests/backend.Tests.csproj currently gives 11 errors and two warnings.

Find the causes of all 11 errors and both warnings, fix them, and make the build and tests fully green.”

How it was used:

AI helped identify the failing areas, while the final verification was performed by rerunning the build and test commands.

## Azure Backend Deployment

### Representative Prompt: Preparing Azure App Service Deployment

“You are helping me prepare the backend of JobQuest for deployment to Azure App Service.

Project information:

C# .NET 10 Web API
Entity Framework Core
PostgreSQL
JWT authentication
Scalar API documentation
Azure Database for PostgreSQL already exists
Use Code deployment, not Docker
Use GitHub Actions
The development branch is dev

Inspect Program.cs, project files, appsettings files, test projects, workflows, and .gitignore before making changes.

Required work:

confirm or add /health;
ensure production settings come from configuration and environment variables;
use configuration-driven CORS;
preserve HTTPS redirection;
preserve the Testing environment used by integration tests;
keep Scalar available in production;
do not introduce unsafe automatic production migrations;
preserve in-memory SQLite for integration tests;
create or update the GitHub Actions deployment workflow;
use .NET 10;
build and test before publishing;
deploy only the published backend output;
use Azure OpenID Connect secrets;
do not add Docker;
create Azure deployment documentation;
run the backend build and tests after changes.”

How it was used:

This produced the backend deployment workflow and deployment documentation while preserving the existing application behaviour.

### Representative Prompt: Azure Portal Configuration Questions

“I want to deploy the backend to Azure App Service. Please teach me step by step.

I am configuring the PostgreSQL firewall but cannot find the expected properties section.

Should I copy IPv4 or IPv6?

Can I add my current public network IP?

What should I enter for the organisation ID?

Why is the selected branch dev rather than main?

What should I select under Assign access to?”

How it was used:

AI was used as an explanation tool while Azure resources were configured manually.

### Representative Prompt: Checking Deployment Completion

“Please check whether this means my backend deployment is complete and working.

Also check whether there are any unexpected files and whether all tests still pass.

Will the selected Azure resources consume paid resources if I chose free tiers?”

How it was used:

The workflow, deployed API, Scalar page, repository status, and resource configuration were manually checked.

## Frontend API Integration and Zustand

### Representative Prompt: Integrating Modules One at a Time

“Help me complete the remaining frontend and backend API integration.

For each module, use this process:

Inspect the real backend request and response DTOs.
Create the corresponding TypeScript types.
Create the service.
Create the Zustand store.
Call it from a temporary page.
Inspect the request and response in the browser Network panel.
Test loading, empty, error, and success states.
Improve the final UI later.

Complete the modules in this order:

applications;
progress;
achievements.

Do not mix all modules together in one change.”

How it was used:

The frontend was integrated module by module using consistent types, services, stores, and routed pages.

### Representative Prompt: Improving the Job Applications Store

“Perform a small, targeted cleanup of the existing Job Applications frontend integration.

Do not redesign the architecture and do not add Progress or Achievements.

Required improvements:

use explicit null checks for activeApplicationId;
clear stale selection after refreshing the list;
sort applications by updatedAt descending;
do not mutate existing arrays;
handle invalid dates safely;
reset application state on logout and 401;
parse ASP.NET ValidationProblemDetails safely;
support 403, 409, and 429 messages;
clear stale selected details after a 404;
keep all API calls through the existing store and service;
run npm run build;
do not use any, ts-ignore, or eslint-disable.”

How it was used:

This improved multi-user state safety, error handling, sorting, and stale-selection behaviour.

### Representative Prompt: Improving ApplicationsPage

“ApplicationsPage.tsx must remain a temporary CRUD integration sandbox.

Please:

replace truthy ID checks with explicit null checks;
prevent duplicate initial requests in React Strict Mode;
prevent stale form data after a failed detail request;
use lightweight create and edit modes;
prevent conflicting operations;
keep all API calls through useJobApplicationsStore;
preserve the current UI error display;
run npm run build.”

How it was used:

The page became more stable before the final visual redesign.

## Frontend UI and Responsive Design

### Representative Prompt: Implementing Login and Register from Figma

“These are the Login and Register pages I designed in Figma.

Implement both pages and replace the temporary pages.

The final details do not need to be exactly identical, but the overall design should remain consistent.

All pages must be responsive and usable on both desktop and mobile.”

How it was used:

The temporary authentication pages were replaced with responsive branded pages.

### Representative Prompt: Improving Auth-Page Responsiveness

“In a normal maximised desktop window, Login and Register should not require vertical scrolling.

The image should scale responsively.

On mobile, the text at the bottom must not be cut in half.

The dark-mode button should not appear awkwardly between two layout sections.

Login and Register should remain visually symmetrical.”

How it was used:

The authentication layouts were refined for both desktop and mobile.

### Representative Prompt: Responsive Navigation

“Keep the sidebar fixed on desktop while the main content scrolls normally.

On mobile, replace it with a top bar, but the current top bar is too large and occupies too much of the screen.

Remove the notification icon and duplicated username from the Applications search area.

The username can appear near logout in the signed-in navigation area.

When mobile navigation cannot display every page at once, it should adapt to the current page so that Progress is still accessible.”

How it was used:

The responsive navigation and signed-in user area were improved without adding a separate Profile page.

### Representative Prompt: Create and Edit Navigation

“After successfully adding an application, return to the Applications page instead of automatically opening the new application in edit mode.

Only enter edit mode when the user selects a specific application.

After successfully saving an edit, return to Applications.

If saving fails, remain on the current page and display the error.

When Add Application is clicked, move directly to the form instead of requiring the user to scroll.

Replace ‘Create blank draft’ with clearer wording such as ‘Clear draft’, and position it where desktop and mobile users can easily find it.”

How it was used:

These prompts improved create and edit navigation and reduced friction in the form workflow.

### Representative Prompt: Unsaved-Change Warning

“When the user is on Add Application or Edit Application and has unsaved changes, navigating to another page should show a professional warning.

The message should explain that leaving now will discard unsaved changes.

This should cover internal navigation and should also consider browser refresh or close behaviour.”

How it was used:

The form gained unsaved-change protection.

### Representative Prompt: Theme Switching

“Connect Login and Register to the same dark-mode switching logic.

Use the existing colour palette for the dark theme.

Place the theme toggle above logout.

Check Applications, Progress, and the other routed pages for text or control colours that become difficult to read in dark mode.”

How it was used:

Theme switching was extended across the routed pages and became one of the final advanced requirements.

## Frontend Testing and Continuous Integration

### Representative Prompt: Increasing Frontend Test Coverage

“Add meaningful frontend tests, with approximately 12 to 20 tests in total. Do not add many tests to every page only to increase the number.

Prioritise:

Authentication:
LoginPage
RegisterPage
ProtectedRoute

Test form rendering, required validation, successful login, failed login, and unauthenticated protected-route access.

Applications:
list rendering;
empty state;
create;
update;
delete confirmation;
API error.

Dashboard:
summary data;
loading;
error.

Achievements:
locked;
unlocked;
loading and error.

Progress:
current weekly goal;
save;
invalid value;
API failure;
updated progress.

Do not add meaningless snapshot tests. Focus on interactions and important states.

Run npm run test after each group.”

How it was used:

The frontend test suite was expanded around key behaviours and interactions rather than snapshots.

### Representative Prompt: Creating the CI Workflow

“Create a validation-only workflow at:

.github/workflows/ci.yml

It should run on:

push to dev;
pull requests targeting main.

Backend steps:

restore;
build;
test.

Frontend steps:

npm ci;
npm run test;
npm run lint;
npm run build.

This workflow should only validate the project and should not deploy it.”

How it was used:

This became the project’s continuous-integration workflow.

## Frontend Deployment

### Representative Prompt: Changing from Azure Static Web Apps to Vercel

“None of the available regions support Azure Static Web Apps for my current setup, and I do not plan to contact Azure Support.

I have decided to use Vercel for the frontend.

I have removed the Azure Static Web Apps configuration.

Please explain the remaining deployment steps clearly and in order.”

How it was used:

The original Azure Static Web Apps plan was replaced by Vercel.

### Representative Prompt: Diagnosing Production API Integration

“The frontend shows that it cannot connect to the API, even though the local backend and frontend work correctly.

How can I confirm which port the backend is listening on?

For production, please check:

VITE_API_BASE_URL;
the production backend URL;
the Vercel project connection;
production CORS;
SPA route fallback.”

How it was used:

The deployed frontend-to-backend connection and production CORS settings were verified.

### Representative Prompt: Branch and Pull-Request Workflow

“I want the final version to remain on main.

I plan to develop on dev, create a pull request into main, allow GitHub Actions to validate it, and ask Copilot to review the pull request.

After both the frontend and backend are deployed, future changes should still be made on dev and merged into main through pull requests.”

How it was used:

The project used a development branch and pull-request review flow.

## Repository and Submission Audits

### Representative Prompt: Complete Submission Audit

“Perform a complete MSA 2026 Phase 2 Software Stream submission audit of the current JobQuest repository.

Do not modify any files.

For every requirement, classify it as:

completed;
partially completed;
not completed;
cannot be verified from the repository;
not applicable.

Inspect:

the full-stack structure;
React and TypeScript;
routes and protected routes;
responsive UI;
frontend tests;
.NET backend;
EF Core and PostgreSQL;
CRUD;
backend tests;
deployment;
Scalar;
Git usage;
gamification;
advanced requirements;
README;
specs;
video requirements;
production readiness.

Run the relevant builds, tests, and lint commands.

Do not guess whether live links or the video are accessible.”

How it was used:

This audit identified remaining submission work and separated blocking issues from optional improvements.

### Representative Prompt: Strict Advanced-Requirements Audit

“Perform a strict audit against all ten official Advanced Requirements.

Do not modify files.

Check:

Storybook;
Security Measures;
state management;
theme switching;
Docker;
WebSockets;
Cypress;
performance tests, logging, and metrics;
multiplayer;
caching and API optimisation.

Do not count a feature only because it appears in a planning document, dependency list, comment, or unused file.

For security, distinguish:

authentication;
ownership-based authorisation;
RBAC;
anti-CSRF;
password hashing;
validation;
sanitisation;
rate limiting.

Recommend exactly the strongest three implemented requirements for README marking.”

How it was used:

The final selected advanced requirements were confirmed as:

- Security Measures
- Zustand State Management
- Theme Switching

The audit also prevented unsupported claims about RBAC, rate limiting, anti-CSRF, sanitisation, Docker, Cypress, Storybook, WebSockets, caching, performance testing, and metrics.

## Documentation Creation and Review

Some quoted prompts in this section mention intermediate specs filenames that were later removed during documentation cleanup. Those filenames are preserved verbatim inside the quoted prompts as historical development evidence.

### Representative Prompt: Generating the Specs Documentation

“Review the entire repository before making any changes.

Create or update:

00-project-context.md
01-project-plan.md
02-architecture.md
03-database-design.md
04-api-design.md
05-authentication-and-security.md
06-gamification-and-business-rules.md
08-agent-instructions.md
09-design-decisions.md
10-testing-and-deployment.md
11-reflection.md

Do not create the AI prompts file yet.

Treat the original planning document as evidence of the initial plan.

Treat the source code, tests, migrations, configuration, workflows, and deployment files as the source of truth for the final implementation.

Do not invent routes, database fields, security measures, tests, deployment services, business rules, or UI pages.

Do not expose secrets.

Only modify files inside the specs directory.”

How it was used:

This generated the first structured documentation set, which was then reviewed and corrected in later passes.

### Representative Prompt: Fact-Checking Project Context, Plan, Architecture, and Database Design

“Perform a strict factual review of:

00-project-context.md
01-project-plan.md
02-architecture.md
03-database-design.md

Compare every technical statement against:

source code;
DTOs;
models;
migrations and the model snapshot;
frontend services and stores;
routes;
tests;
workflows;
deployment configuration.

Pay particular attention to:

exact routes;
package versions;
controller and service flow;
session persistence;
HTTP status codes;
nullable fields;
UserProgress.UpdatedAt;
Achievement.TargetValue constraints;
HasEarnedFollowUpPoints;
unique constraints;
cascade delete;
deployment platforms;
environment variable names;
Mermaid diagrams.

Fix unsupported claims only in these four files.”

How it was used:

This reduced inaccuracies caused by differences between the original plan and the final implementation.

### Representative Prompt: Fact-Checking API, Security, Gamification, and Agent Instructions

“Make a focused documentation-only revision to:

04-api-design.md
05-authentication-and-security.md
06-gamification-and-business-rules.md
08-agent-instructions.md

Re-check controllers, DTOs, services, helpers, stores, routes, hooks, tests, Program.cs, migrations, and configuration.

Required checks include:

the endpoint summary;
relevant file references;
the exact Withdrawn create rule;
exact 409 behaviour;
Scalar route wording;
the protected-data description;
the difference between CORS, authentication, and anti-CSRF;
the Security requirement based on password hashing, server-side validation, and ownership-based authorisation;
the exact points table;
the exact streak triggers;
the Rejected weekly-progress rule;
the Interview achievement boundary;
delete behaviour;
unsupported advanced-feature claims.”

How it was used:

This aligned the most business-rule-sensitive documentation with the final implementation.

### Representative Prompt: Finalising Design Decisions and Testing/Deployment Documentation

“Revise:

09-design-decisions.md
10-testing-and-deployment.md

Confirmed production information:

Frontend:
https://jobquest-shuo.vercel.app/

Backend:
https://jobquest-api-shuo-g6ana9d9avagdafg.australiaeast-01.azurewebsites.net

Scalar:
https://jobquest-api-shuo-g6ana9d9avagdafg.australiaeast-01.azurewebsites.net/scalar/

Frontend hosting:
Vercel

Backend hosting:
Azure App Service

Database:
Azure Database for PostgreSQL Flexible Server

Document the confirmed authentication, deployment, Profile and Progress, and shared Create/Edit-page decisions.

Use npm run test consistently.

Do not expose secrets or modify unrelated files.”

How it was used:

This replaced placeholders and repository-only assumptions with confirmed final deployment information.

## AI Suggestions That Were Rejected or Corrected

### Azure Static Web Apps

The initial plan used Azure Static Web Apps for the frontend. Regional availability prevented this approach, so the final frontend deployment was changed to Vercel.

The old plan was preserved as part of the project history, but final documentation describes Vercel as the deployed platform.

### Profile Page

The initial plan included a Profile page.

During implementation, I decided that it would duplicate information already available on the Progress page and in the signed-in user area.

The final application therefore does not include a Profile route.

### Mantine UI

Some early prompts referred to Mantine components.

The final frontend did not use Mantine, so the final documentation does not list it as part of the implemented technology stack.

### Rate Limiting

Rate limiting appeared in the early security plan but was not implemented.

The final Security Measures advanced requirement is supported by:

- password hashing
- server-side validation
- ownership-based authorisation

### RBAC

The project uses authentication and ownership-based authorisation, but it does not define user roles or role-based policies.

It is therefore not described as using RBAC.

### Anti-CSRF

CORS and JWT bearer authentication were not described as anti-CSRF protection.

The final documentation explicitly states that CORS is a browser origin policy and does not replace authentication, authorisation, or anti-CSRF protection.

### Sanitisation

The backend performs DTO validation, trimming, and normalisation.

This was not exaggerated into a separate sanitisation layer.

### PUT and PATCH

The Job Application update endpoint remained PUT because the frontend sends a complete update object and the existing ownership, validation, transition logic, and tests support that contract.

PATCH is used for the focused Weekly Goal update.

### Testing Commands

Some early prompts used:

npm test -- --run

The final package script already runs Vitest in run mode, so the workflow and documentation were standardised on:

npm run test

## Human Review and Verification

After AI-assisted changes, I performed or requested the following checks:

- backend build
- xUnit tests
- frontend Vitest tests
- frontend linting
- frontend production build
- Scalar manual API testing
- registration and login testing
- protected-route testing
- Job Application CRUD testing
- progress and achievement testing
- multi-user ownership testing
- GitHub Actions workflow verification
- deployed frontend and backend connectivity checks
- production CORS checks
- responsive desktop and mobile checks
- dark-mode contrast checks
- review of specs against the final source code

AI-generated code or documentation was not accepted only because it appeared reasonable.

Statements that were outdated, unsupported, overly broad, or inconsistent with the final code were corrected before submission.

## Final Reflection on AI Use

AI was most effective when I provided:

- the current project state
- the exact files involved
- a narrow objective
- implementation constraints
- expected verification steps

It was less reliable when it had to infer the final state from an old planning document or when deployment and UI decisions had changed during development.

The project therefore used AI as a planning, explanation, implementation, testing, debugging, review, and documentation assistant.

The final technical decisions, verification, and responsibility for the submitted work remained with me.