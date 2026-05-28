using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/documents")]
    public class DocumentNoticeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DocumentNoticeController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAllDocuments()
        {
            var documents = await _context.DocumentNotices
                .Include(d => d.CreatedByUser)
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new
                {
                    d.Id,
                    d.Title,
                    d.Type,
                    d.Description,
                    d.Village,
                    d.FileUrl,
                    d.IsVisibleToResidents,
                    CreatedBy = d.CreatedByUser != null ? d.CreatedByUser.FullName : "",
                    d.CreatedAt,
                    d.UpdatedAt
                })
                .ToListAsync();

            return Ok(documents);
        }

        [HttpGet("village/{village}")]
        public async Task<IActionResult> GetVillageDocuments(string village)
        {
            var decodedVillage = Uri.UnescapeDataString(village);

            var documents = await _context.DocumentNotices
                .Include(d => d.CreatedByUser)
                .Where(d => d.Village == decodedVillage)
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new
                {
                    d.Id,
                    d.Title,
                    d.Type,
                    d.Description,
                    d.Village,
                    d.FileUrl,
                    d.IsVisibleToResidents,
                    CreatedBy = d.CreatedByUser != null ? d.CreatedByUser.FullName : "",
                    d.CreatedAt,
                    d.UpdatedAt
                })
                .ToListAsync();

            return Ok(documents);
        }

        [HttpGet("resident/{village}")]
        public async Task<IActionResult> GetResidentDocuments(string village)
        {
            var decodedVillage = Uri.UnescapeDataString(village);

            var documents = await _context.DocumentNotices
                .Include(d => d.CreatedByUser)
                .Where(d => d.Village == decodedVillage && d.IsVisibleToResidents)
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new
                {
                    d.Id,
                    d.Title,
                    d.Type,
                    d.Description,
                    d.Village,
                    d.FileUrl,
                    CreatedBy = d.CreatedByUser != null ? d.CreatedByUser.FullName : "",
                    d.CreatedAt
                })
                .ToListAsync();

            return Ok(documents);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDocument([FromBody] CreateDocumentNoticeDto request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == request.CreatedByUserName && u.IsActive);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var document = new DocumentNotice
            {
                Title = request.Title,
                Type = request.Type,
                Description = request.Description,
                Village = request.Village,
                FileUrl = request.FileUrl,
                IsVisibleToResidents = request.IsVisibleToResidents,
                CreatedByUserId = user.Id,
                CreatedAt = DateTime.UtcNow
            };

            _context.DocumentNotices.Add(document);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Document or notice saved successfully." });
        }

        [HttpGet("summary/village/{village}")]
        public async Task<IActionResult> GetVillageDocumentSummary(string village)
        {
            var decodedVillage = Uri.UnescapeDataString(village);

            var count = await _context.DocumentNotices
                .CountAsync(d => d.Village == decodedVillage);

            return Ok(new { totalDocuments = count });
        }

        [HttpGet("summary/admin")]
        public async Task<IActionResult> GetAdminDocumentSummary()
        {
            var count = await _context.DocumentNotices.CountAsync();

            return Ok(new { totalDocuments = count });
        }
    }
}