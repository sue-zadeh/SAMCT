using System.ComponentModel.DataAnnotations;

namespace server.DTOs
{
    public class LoginRequestDto
    {
        [Required, StringLength(80)]
        public string UserName { get; set; } = "";

        [Required, StringLength(128)]
        public string Password { get; set; } = "";
    }
}
