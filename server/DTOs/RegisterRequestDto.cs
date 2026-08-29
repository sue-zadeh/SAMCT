using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace server.DTOs
{
    public class RegisterRequestDto
    {
        [Required, StringLength(80, MinimumLength = 3)]
        public string UserName { get; set; } = "";

        [Required, StringLength(80)]
        public string FirstName { get; set; } = "";

        [Required, StringLength(80)]
        public string LastName { get; set; } = "";

        [Required, EmailAddress, StringLength(254)]
        public string Email { get; set; } = "";

        [Required, StringLength(128)]
        public string Password { get; set; } = "";

        [Required, StringLength(40)]
        public string Role { get; set; } = "";

        [StringLength(80)]
        public string Village { get; set; } = "";
        public IFormFile? ProfileImage { get; set; }
    }
}
