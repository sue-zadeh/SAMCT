using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.RegularExpressions;

namespace server.Security;

// Validation for new or changed account details.
public static class UsernameRules
{
    public const string Pattern = @"[A-Za-z0-9_.-]{5,50}";
    public const string Message = "Use 5 to 50 letters, numbers, dots, underscores or hyphens for a new username.";

    // Existing legacy names are checked by login independently.
    public static bool IsValidNewName(string value) =>
        Regex.IsMatch(value, @"\A" + Pattern + @"\z");
}

public sealed class StrongPasswordAttribute : ValidationAttribute
{
    public StrongPasswordAttribute()
    {
        ErrorMessage = "Use at least 8 characters with an uppercase letter, lowercase letter, number and symbol.";
    }

    public override bool IsValid(object? value)
    {
        if (value is not string password || password.Length < 8 ||
            Encoding.UTF8.GetByteCount(password) > 72)
            return false;

        return password.Any(char.IsUpper)
            && password.Any(char.IsLower)
            && password.Any(char.IsDigit)
            && password.Any(character => char.IsPunctuation(character) || char.IsSymbol(character));
    }
}
