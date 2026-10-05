namespace server.Models;

public class MfaChallenge
{
    public string Id { get; set; } = "";
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string PasswordStamp { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
}
