using System.ComponentModel.DataAnnotations;
namespace server.DTOs;
public class ContactRequestDto
{
    [Required, StringLength(160)] public string FullName { get; set; } = "";
    [Required, EmailAddress, StringLength(254)] public string Email { get; set; } = "";
    [Required, StringLength(160), RegularExpression(@"[^\r\n]+")] public string Subject { get; set; } = "";
    [Required, StringLength(40)] public string Phone { get; set; } = "";
    [Required, StringLength(1500)] public string Message { get; set; } = "";
    [StringLength(200)] public string? Website { get; set; }
}
