using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/documents")]
    public class DocumentNoticeController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public DocumentNoticeController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
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
                    d.FileName,
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
                    d.FileName,
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
                    d.FileName,
                    CreatedBy = d.CreatedByUser != null ? d.CreatedByUser.FullName : "",
                    d.CreatedAt
                })
                .ToListAsync();

            return Ok(documents);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDocument(
            [FromForm] string title,
            [FromForm] string type,
            [FromForm] string description,
            [FromForm] string village,
            [FromForm] string createdByUserName,
            [FromForm] bool isVisibleToResidents,
            IFormFile? file)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == createdByUserName && u.IsActive);

            if (user == null)
                return NotFound(new { message = "User not found." });

            string fileUrl = "";

            if (file != null && file.Length > 0)
            {
                fileUrl = await SaveFile(file);
            }

            var document = new DocumentNotice
            {
                Title = title,
                Type = type,
                Description = description,
                Village = village,
                FileUrl = fileUrl,
                IsVisibleToResidents = isVisibleToResidents,
                CreatedByUserId = user.Id,
                CreatedAt = DateTime.UtcNow
            };

            _context.DocumentNotices.Add(document);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Document or notice saved successfully." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(
            int id,
            [FromForm] string title,
            [FromForm] string type,
            [FromForm] string description,
            [FromForm] bool isVisibleToResidents,
            IFormFile? file)
        {
            var document = await _context.DocumentNotices.FindAsync(id);

            if (document == null)
                return NotFound(new { message = "Document not found." });

            document.Title = title;
            document.Type = type;
            document.Description = description;
            document.IsVisibleToResidents = isVisibleToResidents;
            document.UpdatedAt = DateTime.UtcNow;

            if (file != null && file.Length > 0)
            {
                document.FileUrl = await SaveFile(file);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Document updated successfully." });
        }

        [HttpPut("{id}/visibility")]
        public async Task<IActionResult> UpdateVisibility(int id, [FromBody] bool isVisibleToResidents)
        {
            var document = await _context.DocumentNotices.FindAsync(id);

            if (document == null)
                return NotFound(new { message = "Document not found." });

            document.IsVisibleToResidents = isVisibleToResidents;
            document.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Visibility updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var document = await _context.DocumentNotices.FindAsync(id);

            if (document == null)
                return NotFound(new { message = "Document not found." });

            _context.DocumentNotices.Remove(document);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Document deleted successfully." });
        }

        private async Task<string> SaveFile(IFormFile file)
        {
            var allowedExtensions = new[]
            {
                ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png"
            };

            var extension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
                throw new InvalidOperationException("File type is not allowed.");

            var webRoot = _environment.WebRootPath;

            if (string.IsNullOrEmpty(webRoot))
            {
                webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            var uploadFolder = Path.Combine(webRoot, "uploads", "documents");

            if (!Directory.Exists(uploadFolder))
                Directory.CreateDirectory(uploadFolder);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var fullPath = Path.Combine(uploadFolder, fileName);

            using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);

            return $"/uploads/documents/{fileName}";
        }
    }
}