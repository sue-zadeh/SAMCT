using Microsoft.EntityFrameworkCore;
using server.Data;

namespace server.Hosting;

public static class LocalDevelopment
{
    // The automated test runner deliberately uses the same local-only configuration
    // as development. Real Azure production is never treated as a test environment.
    public static bool IsLocalOrTesting(this IWebHostEnvironment environment) =>
        environment.IsDevelopment() || environment.IsEnvironment("Testing");

    // Migrations are opt-in. Production deployment never runs them automatically.
    // Return true only for the command-line --migrate mode, which should exit.
    public static async Task<bool> RunMigrationsIfRequestedAsync(
        this WebApplication app, string[] args, bool localEnvironment)
    {
        var commandLineMigration = args.Contains("--migrate");
        if (!commandLineMigration &&
            (!localEnvironment || !app.Configuration.GetValue<bool>("Database:AutoMigrate")))
            return false;

        using var scope = app.Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync();
        return commandLineMigration;
    }
}
