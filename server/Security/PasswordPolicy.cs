namespace server.Security;

public static class PasswordPolicy
{
    public const int MinimumLength = 12;
    public const int MaximumLength = 128;

    public static string? Validate(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < MinimumLength)
            return $"Password must contain at least {MinimumLength} characters.";

        if (password.Length > MaximumLength)
            return $"Password must contain no more than {MaximumLength} characters.";

        if (!password.Any(char.IsUpper) ||
            !password.Any(char.IsLower) ||
            !password.Any(char.IsDigit) ||
            password.All(char.IsLetterOrDigit))
        {
            return "Password must contain upper-case, lower-case, number, and special characters.";
        }

        return null;
    }
}
