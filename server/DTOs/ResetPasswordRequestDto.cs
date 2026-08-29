using System.ComponentModel.DataAnnotations;

namespace server.DTOs
{
    public class ResetPasswordRequestDto
    {
        [Required, StringLength(256)]
        public string Token { get; set; } = "";

        [Required, StringLength(128)]
        public string NewPassword { get; set; } = "";
    }
}
