# JobQuest Database Design

## Database Technology

The final application uses PostgreSQL through Entity Framework Core and the Npgsql provider.

Primary evidence:

- `backend/backend.csproj`
- `backend/Program.cs`
- `backend/Data/ApplicationDbContext.cs`
- `backend/Migrations/ApplicationDbContextModelSnapshot.cs`

## Final Data Model Overview

The final data model contains these entities:

- `ApplicationUser`
- `JobApplication`
- `UserProgress`
- `Achievement`
- `UserAchievement`

The tables are mapped in `ApplicationDbContext` and reflected in `ApplicationDbContextModelSnapshot.cs`.

## Mermaid ER Diagram

```mermaid
erDiagram
    Users ||--o{ JobApplications : owns
    Users ||--|| UserProgress : has
    Users ||--o{ UserAchievements : unlocks
    Achievements ||--o{ UserAchievements : is_unlocked_by

    Users {
        int Id PK
        string Username UK
        string PasswordHash
        datetime CreatedAt
    }

    JobApplications {
        int Id PK
        int UserId FK
        string CompanyName
        string JobTitle
        string Location nullable
        string JobLink nullable
        string Status
        date AppliedDate nullable
        date NextFollowUpDate nullable
        bool HasEarnedFollowUpPoints
        string Notes nullable
        datetime CreatedAt
        datetime UpdatedAt
    }

    UserProgress {
        int Id PK
        int UserId FK UK
        int TotalPoints
        int CurrentLevel
        int CurrentStreak
        date LastActivityDate nullable
        int WeeklyGoal
        datetime CreatedAt
        datetime UpdatedAt
    }

    Achievements {
        int Id PK
        string Name UK
        string Description
        string Icon nullable
        string ConditionType
        int TargetValue
        datetime CreatedAt
    }

    UserAchievements {
        int Id PK
        int UserId FK
        int AchievementId FK
        datetime UnlockedAt
    }
```

## Entity Details

### Users (`ApplicationUser`)

Mapped table: `Users`

Key fields:

- `Id`: primary key
- `Username`: required, max length 50, unique
- `PasswordHash`: required, max length 500
- `CreatedAt`: UTC timestamp

Relationships:

- one user to many job applications
- one user to one progress row
- one user to many user-achievement rows

Important notes:

- passwords are never stored in plain text
- the `PasswordHash` field stores the output of ASP.NET Core password hashing

Evidence: `backend/Models/ApplicationUser.cs`, `backend/Data/ApplicationDbContext.cs`, `backend/Migrations/ApplicationDbContextModelSnapshot.cs`

### JobApplications (`JobApplication`)

Mapped table: `JobApplications`

Primary key:

- `Id`

Foreign key:

- `UserId` -> `Users.Id`

Required fields:

- `CompanyName`: required, max length 100
- `JobTitle`: required, max length 150
- `Status`: stored as string, max length 50

Optional fields:

- `Location`: max length 150
- `JobLink`: max length 500
- `AppliedDate`
- `NextFollowUpDate`
- `Notes`: max length 2000

Additional fields:

- `HasEarnedFollowUpPoints`: boolean, default `false`
- `CreatedAt`: UTC timestamp
- `UpdatedAt`: UTC timestamp

Relationship behavior:

- many job applications belong to one user
- deleting a user cascades to that user's applications

Evidence: `backend/Models/JobApplication.cs`, `backend/Data/ApplicationDbContext.cs`, `backend/Migrations/20260725111708_AddGamificationSupport.cs`, `backend/Migrations/ApplicationDbContextModelSnapshot.cs`

### UserProgress (`UserProgress`)

Mapped table: `UserProgress`

Primary key:

- `Id`

Foreign key:

- `UserId` -> `Users.Id`

Unique constraint:

- `UserId` is unique, enforcing one progress row per user

Fields:

- `TotalPoints`
- `CurrentLevel`
- `CurrentStreak`
- `LastActivityDate`: nullable `DateOnly`
- `WeeklyGoal`: validated in the model with `[Range(1, 20)]`
- `CreatedAt`
- `UpdatedAt`

Relationship behavior:

- one-to-one relationship with `Users`
- deleting a user cascades to the linked progress row

Evidence: `backend/Models/UserProgress.cs`, `backend/Data/ApplicationDbContext.cs`, `backend/Migrations/ApplicationDbContextModelSnapshot.cs`

### Achievements (`Achievement`)

Mapped table: `Achievements`

Primary key:

- `Id`

Unique constraint:

- `Name` is unique

Fields:

- `Name`: required, max length 100
- `Description`: required, max length 500
- `Icon`: optional, max length 100
- `ConditionType`: required, max length 100
- `TargetValue`: integer, range-constrained in the model
- `CreatedAt`

Seeded templates:

- First Application
- Job Hunter
- Consistent Seeker
- Interview Unlocked
- Offer Hunter

Evidence: `backend/Models/Achievement.cs`, `backend/Helpers/AchievementCatalog.cs`, `backend/Data/ApplicationDbContext.cs`, `backend/Migrations/ApplicationDbContextModelSnapshot.cs`

Note on `TargetValue`:

- `Achievement.TargetValue` has a model-level `[Range(1, int.MaxValue)]` attribute in `backend/Models/Achievement.cs`
- the EF Core snapshot shows it as an integer column, but it does not show a separate database-level check constraint for that range

### UserAchievements (`UserAchievement`)

Mapped table: `UserAchievements`

Primary key:

- `Id`

Foreign keys:

- `UserId` -> `Users.Id`
- `AchievementId` -> `Achievements.Id`

Unique constraint:

- `(UserId, AchievementId)` is unique, preventing duplicate unlock rows for the same user and achievement

Fields:

- `UnlockedAt`: UTC timestamp

Relationship behavior:

- deleting a user cascades to the user's unlock rows
- deleting an achievement cascades to related user-achievement rows

Evidence: `backend/Models/UserAchievement.cs`, `backend/Data/ApplicationDbContext.cs`, `backend/Migrations/ApplicationDbContextModelSnapshot.cs`

## Required and Optional Field Summary

### Required values enforced by the final model

- `Users.Username`
- `Users.PasswordHash`
- `JobApplications.CompanyName`
- `JobApplications.JobTitle`
- `JobApplications.Status`
- `Achievements.Name`
- `Achievements.Description`
- `Achievements.ConditionType`

### Optional values in the final model

- `JobApplications.Location`
- `JobApplications.JobLink`
- `JobApplications.AppliedDate`
- `JobApplications.NextFollowUpDate`
- `JobApplications.Notes`
- `UserProgress.LastActivityDate`
- `Achievements.Icon`

## Relationships and Delete Behavior

The identifiable delete behaviors are all configured as cascade deletes in `ApplicationDbContext`:

- user -> job applications: cascade
- user -> progress: cascade
- user -> user achievements: cascade
- achievement -> user achievements: cascade

## Multi-User Data Separation

The schema is intentionally multi-user.

Important separation mechanisms:

- every `JobApplication` row belongs to one `UserId`
- every `UserProgress` row belongs to one `UserId`
- every `UserAchievement` row belongs to one `UserId`
- controllers filter data by the authenticated user ID before returning or mutating records

This design ensures one user cannot see another user's applications, progress, or unlocked achievements through the normal API paths.

## PasswordHash Storage

The final model stores only `PasswordHash`, not a plain-text password field.

Evidence:

- `backend/Models/ApplicationUser.cs`
- `backend/Services/AuthService.cs`
- `backend/Migrations/ApplicationDbContextModelSnapshot.cs`

## Achievement Templates and User Achievement Relationship

Achievements are split into two layers:

- `Achievements` contains the shared template catalog
- `UserAchievements` records which template a specific user has unlocked and when

This allows the API to return all available achievements together with user-specific unlocked state.

Evidence:

- `backend/Helpers/AchievementCatalog.cs`
- `backend/Services/ProgressService.cs`
- `backend/Models/Achievement.cs`
- `backend/Models/UserAchievement.cs`

## Date and Timestamp Handling

The final model uses both `DateTime` and `DateOnly`.

### `DateTime` usage

- `CreatedAt` and `UpdatedAt` fields use UTC timestamps
- `UnlockedAt` uses a UTC timestamp

### `DateOnly` usage

- `AppliedDate`
- `NextFollowUpDate`
- `LastActivityDate`
- weekly goal summary boundaries in progress responses

In the PostgreSQL mapping snapshot:

- `DateOnly` values are stored as `date`
- `DateTime` values are stored as `timestamp with time zone`
