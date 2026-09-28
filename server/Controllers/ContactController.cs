using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using server.Data;
using server.DTOs;
using server.Models;
using server.Services;
namespace server.Controllers;

[ApiController, Route("api/contact"), AllowAnonymous, EnableRateLimiting("contact")]
public class ContactController(AppDbContext database, IEmailService emailService, ILogger<ContactController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Send([FromBody] ContactRequestDto request)
    {
        if (!string.IsNullOrEmpty(request.Website)) return Ok(new { message = "Contact message received." });
        var message = new ContactMessage { FullName = request.FullName.Trim(), Email = request.Email.Trim(),
            Subject = request.Subject.Trim(), Phone = request.Phone.Trim(), Message = request.Message.Trim(), CreatedAt = DateTime.UtcNow };
        database.ContactMessages.Add(message);
        await database.SaveChangesAsync();
        try { await emailService.SendContactEmail(message.FullName, message.Email, message.Subject, message.Phone, message.Message); }
        catch (Exception) {
            logger.LogError("Contact message {MessageId} saved but email delivery failed; check email configuration", message.Id);
            return StatusCode(503, new { message = "Your message was saved, but email delivery is delayed. Please call SAMCT if it is urgent." });
        }
        return Ok(new { message = "Contact message sent successfully." });
    }
}
