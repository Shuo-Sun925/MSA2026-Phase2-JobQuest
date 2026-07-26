using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests.TestHelpers;

internal static class TestDbContextFactory
{
    public static ApplicationDbContext CreateContext(
        string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }
}