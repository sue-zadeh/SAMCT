using System.Security.Claims;

namespace server.Security;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var userId) ? userId : 0;
    }

    public static string GetUserName(this ClaimsPrincipal principal) =>
        principal.FindFirstValue(ClaimTypes.Name) ?? "";

    public static string GetVillage(this ClaimsPrincipal principal) =>
        principal.FindFirstValue("village") ?? "";

    public static string GetJwtId(this ClaimsPrincipal principal) =>
        principal.FindFirstValue("jti") ?? "";

    public static DateTime GetTokenExpiryUtc(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue("exp");
        return long.TryParse(value, out var seconds)
            ? DateTimeOffset.FromUnixTimeSeconds(seconds).UtcDateTime
            : DateTime.UtcNow;
    }

    public static bool IsAdmin(this ClaimsPrincipal principal) =>
        SamctRoles.AdminRoles.Any(principal.IsInRole);

    public static bool CanAccessVillage(this ClaimsPrincipal principal, string village) =>
        principal.IsAdmin() ||
        (principal.IsInRole(SamctRoles.VillageManager) &&
         string.Equals(principal.GetVillage(), village, StringComparison.OrdinalIgnoreCase));
}
