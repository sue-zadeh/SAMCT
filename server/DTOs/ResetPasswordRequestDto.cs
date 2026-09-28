using System.ComponentModel.DataAnnotations;
using server.Security;
namespace server.DTOs
{
    public class ResetPasswordRequestDto
    {
        [Required, StringLength(64, MinimumLength = 64), RegularExpression(@"[A-Fa-f0-9]{64}")]
        public string Token { get; set; } = "";
        [Required, StrongPassword]
        public string NewPassword { get; set; } = "";
    }
}