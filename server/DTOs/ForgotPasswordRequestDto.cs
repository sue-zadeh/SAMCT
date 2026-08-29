using System.ComponentModel.DataAnnotations;

namespace server.DTOs
{
    public class ForgotPasswordRequestDto
    {
        [Required, EmailAddress, StringLength(254)]
        public string Email { get; set; } = "";
    }
}
