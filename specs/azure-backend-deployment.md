# JobQuest Backend Azure App Service Deployment

## Architecture

- Frontend: Azure Static Web Apps
- Backend: Azure App Service
- Database: Azure Database for PostgreSQL

## Azure App Service Settings

Configure these application settings in the Azure Web App:

- `ASPNETCORE_ENVIRONMENT=Production`
- `ConnectionStrings__DefaultConnection=<your-postgresql-connection-string>`
- `Jwt__Key=<strong-random-secret>`
- `Jwt__Issuer=JobQuestApi`
- `Jwt__Audience=JobQuestFrontend`
- `Jwt__ExpiryMinutes=120`
- `Cors__AllowedOrigins=https://<your-static-web-app-domain>`

Notes:

- For local frontend development, `http://localhost:5173` is already configured in [backend/appsettings.Development.json](/Users/sunshuo/Desktop/msa2026/MSA2026-Phase2-JobQuest/backend/appsettings.Development.json).
- In App Service, `Cors__AllowedOrigins` can contain one origin or multiple origins separated by commas or semicolons.
- Do not store secrets in `appsettings.json`.

## GitHub Secrets And Variables

Required repository secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

Required repository variable:

- `AZURE_WEBAPP_NAME`

These are used by [.github/workflows/backend-appservice.yml](/Users/sunshuo/Desktop/msa2026/MSA2026-Phase2-JobQuest/.github/workflows/backend-appservice.yml).

## Create The Azure App Service

Create a Web App for code deployment:

1. Create an App Service plan.
2. Create a Web App.
3. Publish type: `Code`.
4. Runtime stack: `.NET 10`.
5. Operating system: choose the App Service option supported by your subscription and region for `.NET 10` code deployment.
6. Configure the application settings listed above.
7. Set the startup command only if your App Service runtime specifically requires one. For normal ASP.NET Core code deployment, leave it empty.

## Enable HTTPS Only

In the Azure portal:

1. Open the Web App.
2. Go to `Settings` -> `Configuration` or `TLS/SSL settings` depending on the portal view.
3. Turn on `HTTPS Only`.

The backend keeps `UseHttpsRedirection()` enabled outside the `Testing` environment, so App Service HTTPS remains intact.

## PostgreSQL Firewall Access

Allow the App Service outbound IPs to reach Azure Database for PostgreSQL:

1. Open the PostgreSQL server in Azure.
2. Go to `Networking` or `Connection security`.
3. Add firewall rules for the App Service outbound IP addresses.
4. If you later use VNet integration and private access, update the database access strategy accordingly.

## EF Core Migrations

The backend does not auto-apply migrations on startup. Keep migrations manual for production safety.

Recommended process:

1. Update the production connection string in your local shell or a secure pipeline environment.
2. Run `dotnet ef database update --project backend/backend.csproj`.
3. Verify the migration succeeded before deploying the app.

Do not point integration tests at Azure PostgreSQL. The integration test host continues to replace the database with SQLite in memory.

## Verification Checklist

After deployment, verify these URLs and flows:

- `GET /health` returns `200 OK`
- Scalar loads at `/scalar`
- Register and login work
- Protected endpoints reject missing or invalid bearer tokens
- JobApplication CRUD works for the authenticated user
- Progress endpoints return the correct user-specific data
- Achievements endpoint returns seeded achievement definitions and unlocked state

Suggested smoke tests:

1. `GET https://<your-webapp>.azurewebsites.net/health`
2. Open `https://<your-webapp>.azurewebsites.net/scalar`
3. Register a user through the API
4. Log in and capture the JWT
5. Call protected endpoints with `Authorization: Bearer <token>`

## Troubleshooting

### Startup failure

- Check App Service log stream.
- Verify `ConnectionStrings__DefaultConnection`, `Jwt__Key`, `Jwt__Issuer`, and `Jwt__Audience` are present.
- Confirm the deployed output came from the published backend folder, not the repository root.

### JWT configuration errors

- Make sure `Jwt__Key` is set.
- Make sure the frontend sends `Authorization: Bearer <token>`.
- Make sure `Jwt__Issuer` and `Jwt__Audience` match what the backend uses to create tokens.

### Database connection errors

- Verify the PostgreSQL connection string.
- Verify firewall rules allow App Service outbound IPs.
- Verify the database user has permission to connect and apply schema updates.

### CORS errors

- Verify `Cors__AllowedOrigins` exactly matches the frontend origin, including `https://`.
- Do not include trailing slashes.
- For local development, use `http://localhost:5173`.
