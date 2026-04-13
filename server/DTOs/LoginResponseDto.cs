namespace server.DTOs
{
    public class LoginResponseDto
    {
        public string Message { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string FullName { get; set; } = "";
        public string Role { get; set; } = "";
        public string ProfileImageUrl { get; set; } = "";
    }
}