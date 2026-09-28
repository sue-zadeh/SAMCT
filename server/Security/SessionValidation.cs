using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using server.Data;

namespace server.Security;

public class SessionValidation(AppDbContext database) : CookieAuthenticationEvents
{
    public override async Task ValidatePrincipal(CookieValidatePrincipalContext context)
    {
        var sessionId = context.Principal?.FindFirst("session")?.Value;
        var session = await database.AuthSessions.AsNoTracking().Include(item => item.User)
            .SingleOrDefaultAsync(item => item.Id == sessionId && item.ExpiresAt > DateTime.UtcNow);
        if (session is null || !session.User.IsActive || !AccessRules.Roles.Contains(session.User.Role))
        {
            context.RejectPrincipal();
            await context.HttpContext.SignOutAsync();
            return;
        }
        context.ReplacePrincipal(AccessRules.Principal(session.User, session.Id));
    }
    public override Task RedirectToLogin(RedirectContext<CookieAuthenticationOptions> context)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    }
    public override Task RedirectToAccessDenied(RedirectContext<CookieAuthenticationOptions> context)
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    }
}
