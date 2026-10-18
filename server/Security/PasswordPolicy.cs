
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace server.Security;

public sealed class StrongPasswordAttribute : ValidationAttribute
{
    public StrongPasswordAttribute()
    {
        ErrorMessage =
            "Use at least 8 characters with an uppercase letter, " +
            "lowercase letter, number and symbol.";
    }

    public override bool IsValid(object? value)
    {
        // Make sure a password was provided
        if (value is not string password)
            return false;

        // Require at least 8 characters
        if (password.Length < 8)
            return false;

        // BCrypt supports up to 72 UTF-8 bytes
        if (Encoding.UTF8.GetByteCount(password) > 72)
            return false;

        // Require all four character types
        return password.Any(char.IsUpper)
            && password.Any(char.IsLower)
            && password.Any(char.IsDigit)
            && password.Any(character =>
                char.IsPunctuation(character) ||
                char.IsSymbol(character));
    }
}
