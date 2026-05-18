namespace server.DTOs
{
    public class RegisterRequestDto
    {
        public string UserName { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string Role { get; set; } = "";
        public string Village { get; set; } = "";
        public string ProfileImageUrl { get; set; } = "";
    }
}