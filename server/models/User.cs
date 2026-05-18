namespace server.Models
{
    public class User
    {
        public int Id { get; set; }

        public string UserName { get; set; } = "";

        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string FullName { get; set; } = "";

        public string Email { get; set; } = "";
        public string PasswordHash { get; set; } = "";

        public string Role { get; set; } = "";
        public string Village { get; set; } = "";

        public string ProfileImageUrl { get; set; } = "";

        public bool IsActive { get; set; } = true;
    }
}