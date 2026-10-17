using System.ComponentModel.DataAnnotations;
using server.Security;
namespace server.DTOs
{
    public class UpdatePasswordRequestDto
    {
        [Required, StringLength(50)]
        public string UserName { get; set; } = "";
        [Required, StringLength(72)]
        public string CurrentPassword { get; set; } = "";
        [Required, StrongPassword]
        public string NewPassword { get; set; } = "";
    }
}
