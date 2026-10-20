namespace server.Hosting;

// Serve the single React application for browser routes. APIs remain separate.
public static class FrontendRoutes
{
    public static void MapFrontendPages(this WebApplication app)
    {
        var html = Path.Combine(
            app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot"),
            "index.html");
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
