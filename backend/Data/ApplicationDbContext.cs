using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<ApplicationUser> Users =>
        Set<ApplicationUser>();

    public DbSet<JobApplication> JobApplications =>
        Set<JobApplication>();

    public DbSet<UserProgress> UserProgress =>
        Set<UserProgress>();

    public DbSet<Achievement> Achievements =>
        Set<Achievement>();

    public DbSet<UserAchievement> UserAchievements =>
        Set<UserAchievement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureApplicationUser(modelBuilder);
        ConfigureJobApplication(modelBuilder);
        ConfigureUserProgress(modelBuilder);
        ConfigureAchievement(modelBuilder);
        ConfigureUserAchievement(modelBuilder);
    }

    private static void ConfigureApplicationUser(
        ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.HasKey(user => user.Id);

            entity.Property(user => user.Username)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(user => user.Username)
                .IsUnique();

            entity.Property(user => user.PasswordHash)
                .IsRequired()
                .HasMaxLength(500);
        });
    }

    private static void ConfigureJobApplication(
        ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<JobApplication>(entity =>
        {
            entity.HasKey(application => application.Id);

            entity.Property(application => application.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            entity.HasOne(application => application.User)
                .WithMany(user => user.JobApplications)
                .HasForeignKey(application => application.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureUserProgress(
        ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserProgress>(entity =>
        {
            entity.HasKey(progress => progress.Id);

            entity.HasOne(progress => progress.User)
                .WithOne(user => user.Progress)
                .HasForeignKey<UserProgress>(
                    progress => progress.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(progress => progress.UserId)
                .IsUnique();
        });
    }

    private static void ConfigureAchievement(
        ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Achievement>(entity =>
        {
            entity.HasKey(achievement => achievement.Id);
            entity.HasIndex(achievement => achievement.Name)
                .IsUnique();            
        });
    }

    private static void ConfigureUserAchievement(
        ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserAchievement>(entity =>
        {
            entity.HasKey(userAchievement => userAchievement.Id);

            entity.HasOne(userAchievement => userAchievement.User)
                .WithMany(user => user.UserAchievements)
                .HasForeignKey(userAchievement => userAchievement.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(userAchievement => userAchievement.Achievement)
                .WithMany(achievement => achievement.UserAchievements)
                .HasForeignKey(userAchievement => userAchievement.AchievementId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(userAchievement => new
            {
                userAchievement.UserId,
                userAchievement.AchievementId
            }).IsUnique();
        });
    }
}