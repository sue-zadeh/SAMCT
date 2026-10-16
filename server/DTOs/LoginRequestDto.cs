using System.ComponentModel.DataAnnotations;
namespace server.DTOs
{
    public class LoginRequestDto
    {
        // Existing accounts can predate the current registration naming rules.
        // Authenticate their stored username; do not silently remove internal spaces.
        [Required(ErrorMessage = "Enter your username."), StringLength(50, ErrorMessage = "Username must be at most 50 characters.")]
        public string UserName { get; set; } = "";
        [Required(ErrorMessage = "Enter your password."), StringLength(72, ErrorMessage = "Password must be at most 72 characters.")]
        public string Password { get; set; } = "";
    }
}
