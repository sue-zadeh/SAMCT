using System.ComponentModel.DataAnnotations;
using server.Security;
namespace server.DTOs
{
    public class UserResponseDto
    {
        public int Id { get; set; }
        [Required, StringLength(50, MinimumLength = 3), RegularExpression(@"[A-Za-z0-9_.-]+")]
        public string UserName { get; set; } = "";
        [Required, StringLength(80)]
        public string FirstName { get; set; } = "";
        [Required, StringLength(80)]
        public string LastName { get; set; } = "";
        public string FullName { get; set; } = "";
        [Required, EmailAddress, StringLength(254)]
        public string Email { get; set; } = "";
        [Required, StringLength(40)]
        public string Role { get; set; } = "";
        [Required, StringLength(60)]
        public string Village { get; set; } = "";
        public string ProfileImageUrl { get; set; } = "";
        public bool IsActive { get; set; }
    }
}