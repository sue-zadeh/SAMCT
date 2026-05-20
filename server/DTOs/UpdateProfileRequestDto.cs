namespace server.DTOs
{
    public class UpdateProfileRequestDto
    {
        public string CurrentUsername { get; set; } = "";
        public string UserName { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Village { get; set; } = "";
    }
}