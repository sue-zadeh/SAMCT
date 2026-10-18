namespace server.Models;

public class AuthSession
{
    public string Id { get; set; } = "";
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime ExpiresAt { get; set; } // Server-enforced 20-minute inactivity deadline.
    public bool MfaVerified { get; set; } // Legacy column; no longer used for authentication.
}
