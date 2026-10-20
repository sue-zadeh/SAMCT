namespace server.Hosting;

// React routing belongs here, not inside the ASP.NET Core application bootstrap.
// The public build includes pre-rendered HTML; all private pages use the portal shell.
public static class FrontendRoutes
{
    public static void MapFrontendPages(this WebApplication app)
    {
        var webRoot = app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");
        if (!File.Exists(Path.Combine(webRoot, "portal.html"))) return;

        foreach (var route in new[] { "/about", "/marketing", "/contactUs" })
        {
            var pagePath = Path.Combine(webRoot, route.TrimStart('/'), "index.html");
            app.MapGet(route, () => Results.File(pagePath, "text/html; charset=utf-8")).AllowAnonymous();
        }

        var portalPath = Path.Combine(webRoot, "portal.html");
        foreach (var prefix in new[] { "login", "register", "forgot-password", "reset-password",
                                       "admin", "resident", "village-manager", "account" })
        {
            app.MapGet("/" + prefix, () => Results.File(portalPath, "text/html; charset=utf-8")).AllowAnonymous();
            app.MapGet("/" + prefix + "/{**rest}", () => Results.File(portalPath, "text/html; charset=utf-8")).AllowAnonymous();
        }
    }
}
