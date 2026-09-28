using System.ComponentModel.DataAnnotations;
using server.Security;
using Microsoft.AspNetCore.Http;

namespace server.DTOs
{
    public class RegisterRequestDto
    {
        [Required, StringLength(50, MinimumLength = 3), RegularExpression(@"[A-Za-z0-9_.-]+")]
        public string UserName { get; set; } = "";
        [Required, StringLength(80)]
        public string FirstName { get; set; } = "";
        [Required, StringLength(80)]
        public string LastName { get; set; } = "";
        [Required, EmailAddress, StringLength(254)]
        public string Email { get; set; } = "";
        [Required, StrongPassword]
        public string Password { get; set; } = "";
        [Required, StringLength(40)]
        public string Role { get; set; } = "";
        [Required, StringLength(60)]
        public string Village { get; set; } = "";
        public IFormFile? ProfileImage { get; set; }
    }
}