using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
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
        private readonly IEmailService _emailService;

        public ContactController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpPost]
        [EnableRateLimiting("contact")]
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

            if (request.FullName.Length > 150 || request.Email.Length > 254 ||
                request.Subject.Length > 200 || request.Phone.Length > 50 ||
                request.Message.Length > 5_000 ||
                !new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(request.Email))
            {
                return BadRequest(new { message = "One or more contact fields are invalid." });
            }

            request.Id = 0;
            request.FullName = request.FullName.Trim();
            request.Email = request.Email.Trim();
            request.Subject = request.Subject.Trim();
            request.Phone = request.Phone.Trim();
            request.Message = request.Message.Trim();
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
