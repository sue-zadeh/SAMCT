namespace server.Hosting;

// Generic ASP.NET Core support for a built React single-page application.
// CI/CD builds and deploys the files; this middleware serves them over HTTP.
public static class FrontendRoutes
{
    public static void UseReactClient(this WebApplication app)
    {
        // Vite's dist folder is published into wwwroot with the API.
        app.UseDefaultFiles();
        app.UseStaticFiles();

        var html = Path.Combine(
            app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot"),
            "index.html");

        // Browser navigation needs the React HTML shell. Unknown APIs/files stay 404.
        if (!File.Exists(html)) return;
        app.MapFallback(async context =>
        {
            if (context.Request.Path.StartsWithSegments("/api") ||
                context.Request.Path.StartsWithSegments("/uploads") ||
                Path.HasExtension(context.Request.Path.Value))
            {
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                return;
            }

            context.Response.ContentType = "text/html; charset=utf-8";
            await context.Response.SendFileAsync(html);
        }).AllowAnonymous();
    }
}
