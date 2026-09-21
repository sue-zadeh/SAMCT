using System.Security.Claims;
using server.Models;

namespace server.Security;

public static class AccessRules
{
    // These existing job titles share the Administration portal.
    public const string AdminRoles = "Admin,CompanySecretary,FinancialAdvisor,Chairman";
    public const string StaffRoles = AdminRoles + ",VillageManager";
    public static readonly string[] Roles = ["Resident", "VillageManager", "Admin", "CompanySecretary", "FinancialAdvisor", "Chairman"];
    public static readonly string[] Villages = ["Ngatea", "Whitianga"];
    public static bool IsAdmin(this ClaimsPrincipal principal) => AdminRoles.Split(',').Any(principal.IsInRole);
    public static int UserId(this ClaimsPrincipal principal) => int.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;
    public static string Village(this ClaimsPrincipal principal) => principal.FindFirstValue("village") ?? "";
    public static bool CanManageVillage(this ClaimsPrincipal principal, string village) => principal.IsAdmin() || (principal.IsInRole("VillageManager") && principal.Village() == village);
    public static bool CanReadResidentVillage(this ClaimsPrincipal principal, string village) => principal.IsInRole("Resident") && principal.Village() == village;
    public static bool IsSelf(this ClaimsPrincipal principal, string username) => string.Equals(principal.Identity?.Name, username.Trim(), StringComparison.OrdinalIgnoreCase);
    public static ClaimsPrincipal Principal(User user, string sessionId) => new(new ClaimsIdentity([
        new(ClaimTypes.NameIdentifier, user.Id.ToString()), new(ClaimTypes.Name, user.UserName),
        new(ClaimTypes.Role, user.Role), new("village", user.Village), new("session", sessionId)
    ], "Cookies"));
}
