using System.Text.RegularExpressions;

namespace server.Security;

public static class UsernameRules
{
    public const string Pattern = @"[A-Za-z0-9_.-]{5,50}";
    public const string Message = "Use 5 to 50 letters, numbers, dots, underscores or hyphens for a new username.";

    // Apply naming rules to new names, not identities already stored by older versions.
    public static bool IsValidNewName(string value) => Regex.IsMatch(value, @"\A" + Pattern + @"\z");
}
