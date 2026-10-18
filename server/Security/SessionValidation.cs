using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using server.Data;

namespace server.Security;

public class SessionValidation(AppDbContext database, JwtAuthentication jwt) : JwtBearerEvents
{
    public override Task MessageReceived(MessageReceivedContext context)
    {
        if (!context.Request.Headers.ContainsKey("Authorization"))
            context.Token = context.Request.Cookies[jwt.CookieName];
        return Task.CompletedTask;
    }

    public override async Task TokenValidated(TokenValidatedContext context)
    {
        var sessionId = context.Principal?.FindFirst("session")?.Value;
        var subject = context.Principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        var session = await database.AuthSessions.AsNoTracking().Include(item => item.User)
            .SingleOrDefaultAsync(item => item.Id == sessionId);
        if (session is null || !int.TryParse(subject, out var userId) || userId != session.UserId ||
            !session.User.IsActive || !AccessRules.Roles.Contains(session.User.Role))
        {
            context.Fail("The session is no longer valid.");
            jwt.SignOut(context.HttpContext);
            return;
        }
        if (session.ExpiresAt <= DateTime.UtcNow) {
            context.HttpContext.Items["SessionExpiredReason"] = "inactivity";
            context.Fail("The session expired after inactivity.");
            jwt.SignOut(context.HttpContext);
            return;
        }
        context.HttpContext.Items["SessionExpiresAt"] = session.ExpiresAt;
        // Always use current database permissions, never stale role claims from a token.
        context.Principal = AccessRules.Principal(session.User, session.Id);
    }

    public override Task AuthenticationFailed(AuthenticationFailedContext context) {
        jwt.SignOut(context.HttpContext);
        return Task.CompletedTask;
    }

    public override async Task Challenge(JwtBearerChallengeContext context) {
        context.HandleResponse();
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        context.Response.Headers.WWWAuthenticate = "Bearer";
        var idle = context.HttpContext.Items["SessionExpiredReason"] as string == "inactivity";
        if (idle) context.Response.Headers["X-Session-Expired"] = "inactivity";
        await context.Response.WriteAsJsonAsync(new {
            code = idle ? "inactivity" : "unauthenticated",
            message = idle ? "You were logged out after 20 minutes of inactivity. Please sign in again." : "Please sign in again."
        });
    }
}
