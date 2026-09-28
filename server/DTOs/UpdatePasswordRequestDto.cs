using System.ComponentModel.DataAnnotations;
using server.Security;
namespace server.DTOs
{
    public class UpdatePasswordRequestDto
    {
        [Required, StringLength(50, MinimumLength = 3), RegularExpression(@"[A-Za-z0-9_.-]+")]
        public string UserName { get; set; } = "";
        [Required, StringLength(72)]
        public string CurrentPassword { get; set; } = "";
        [Required, StrongPassword]
        public string NewPassword { get; set; } = "";
    }
}