namespace server.Models;

public class AuthSession
{
    public string Id { get; set; } = "";
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
}
