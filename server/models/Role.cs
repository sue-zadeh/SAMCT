namespace server.Models
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";

        public List<UserRole> UserRoles { get; set; } = new();
    }
}
