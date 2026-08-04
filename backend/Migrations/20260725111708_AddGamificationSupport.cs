using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddGamificationSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasEarnedFollowUpPoints",
                table: "JobApplications",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.InsertData(
                table: "Achievements",
                columns: new[] { "Id", "ConditionType", "CreatedAt", "Description", "Icon", "Name", "TargetValue" },
                values: new object[,]
                {
                    { 1, "applications_created", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create your first job application.", "rocket", "First Application", 1 },
                    { 2, "applications_created", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create five job applications.", "briefcase", "Job Hunter", 5 },
                    { 3, "streak_days", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Reach a 3-day activity streak.", "calendar", "Consistent Seeker", 3 },
                    { 4, "status_reached", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Reach the interview stage.", "sparkles", "Interview Unlocked", 4 },
                    { 5, "status_reached", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Reach the offer stage.", "trophy", "Offer Hunter", 5 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Achievements",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Achievements",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Achievements",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Achievements",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Achievements",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DropColumn(
                name: "HasEarnedFollowUpPoints",
                table: "JobApplications");
        }
    }
}
