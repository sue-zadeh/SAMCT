using Microsoft.AspNetCore.Mvc;
using server.Data;
using server.Models;
using server.Services;

namespace server.Controllers
{
    [ApiController]
    [Route("api/contact")]
    public class ContactController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public ContactController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> SendContactMessage([FromBody] ContactMessage request)
        {
            if (
                string.IsNullOrWhiteSpace(request.FullName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Subject) ||
                string.IsNullOrWhiteSpace(request.Phone) ||
                string.IsNullOrWhiteSpace(request.Message)
            )
            {
                return BadRequest(new { message = "Please complete all fields." });
            }

            request.CreatedAt = DateTime.UtcNow;

            _context.ContactMessages.Add(request);
            await _context.SaveChangesAsync();

            await _emailService.SendContactEmail(
                request.FullName,
                request.Email,
                request.Subject,
                request.Phone,
                request.Message
            );

            return Ok(new { message = "Contact message sent successfully." });
        }
    }
}