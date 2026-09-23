using System.ComponentModel.DataAnnotations;
using System.Text;

namespace server.Security;

public sealed class StrongPasswordAttribute : ValidationAttribute
{
    public StrongPasswordAttribute() => ErrorMessage = "Use at least 12 characters and no more than 72 UTF-8 bytes for your password.";
    public override bool IsValid(object? value) => value is string password && password.Length >= 12 &&
        Encoding.UTF8.GetByteCount(password) <= 72 && !string.IsNullOrWhiteSpace(password);
}
