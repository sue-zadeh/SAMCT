namespace server.Models;

public class RevokedToken
{
    public int Id { get; set; }
    public string JwtId { get; set; } = "";
    public int UserId { get; set; }
    public DateTime RevokedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAtUtc { get; set; }
}
