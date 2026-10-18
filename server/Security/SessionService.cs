using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Security;

public class SessionService(AppDbContext database)
{
    public static readonly TimeSpan IdleTimeout = TimeSpan.FromMinutes(20);
    public Task<User?> LockUser(int id) => database.Users.FromSqlInterpolated(
        $"SELECT * FROM \"Users\" WHERE \"Id\" = {id} FOR UPDATE").SingleOrDefaultAsync();

    // The login action holds the user-row lock and commits before issuing the JWT.
    public async Task<AuthSession> CreateSession(User user, HttpContext context)
    {
        user.FailedLoginAttempts = 0;
        user.LockoutEnd = null;
        var previousSession = context.User.FindFirst("session")?.Value;
        await database.AuthSessions.Where(session => session.Id == previousSession || session.ExpiresAt <= DateTime.UtcNow).ExecuteDeleteAsync();
        var session = new AuthSession {
            Id = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)),
            UserId = user.Id, ExpiresAt = DateTime.UtcNow.Add(IdleTimeout)
        };
        database.AuthSessions.Add(session);
        await database.SaveChangesAsync();
        return session;
    }
}
