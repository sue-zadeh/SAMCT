using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
// Gives EF Core async methods such as ToListAsync().
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;
using server.Security;
namespace server.Controllers;

[ApiController, Route("api/documents"), Authorize]
public class DocumentNoticeController(AppDbContext database, UploadStorage uploads) : ControllerBase
{
<<<<<<< HEAD
  // Tell ASP.NET this class is an API controller.
    [ApiController]
    // Base endpoint for everything in this controller.
    [Route("api/documents")]
    public class DocumentNoticeController : ControllerBase
    {
    // Store our database context.
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public DocumentNoticeController(AppDbContext context, IWebHostEnvironment environment)
        {
      // Save it so our methods can access the database.
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
            string fileName = "";

            if (file != null && file.Length > 0)
            {
                fileUrl = await SaveFile(file);
                fileName = file.FileName;

            }

            var document = new DocumentNotice
            {
                Title = title,
                Type = type,
                Description = description,
                Village = village,
                FileUrl = fileUrl,
                FileName = fileName,
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
                document.FileName = file.FileName;
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

        [HttpGet("summary/resident/{village}")]
public async Task<IActionResult> GetResidentDocumentSummary(string village)
{
    var decodedVillage = Uri.UnescapeDataString(village);

    var count = await _context.DocumentNotices
        .CountAsync(d =>
            d.Village == decodedVillage &&
            d.IsVisibleToResidents);

    return Ok(new
    {
        totalDocuments = count
    });
}
=======
    private async Task<IActionResult> List(string? village, bool residentsOnly = false) => Ok(await database.DocumentNotices.AsNoTracking()
        .Where(item => (village == null || item.Village == village) && (!residentsOnly || item.IsVisibleToResidents))
        .OrderByDescending(item => item.CreatedAt).Select(item => new {
            item.Id, item.Title, item.Type, item.Description, item.Village, item.FileUrl, item.FileName, item.IsVisibleToResidents,
            CreatedBy = item.CreatedByUser != null ? item.CreatedByUser.FullName : "", item.CreatedAt, item.UpdatedAt
        }).ToListAsync());
    [HttpGet("admin"), Authorize(Roles = AccessRules.AdminRoles)]
    public Task<IActionResult> GetAll() => List(null);
    [HttpGet("village/{village}"), Authorize(Roles = AccessRules.StaffRoles)]
    public Task<IActionResult> GetVillage(string village) => User.CanManageVillage(village) ? List(village) : Task.FromResult<IActionResult>(Forbid());
    [HttpGet("resident/{village}"), Authorize(Roles = "Resident")]
    public Task<IActionResult> GetResident(string village) => User.CanReadResidentVillage(village) ? List(village, true) : Task.FromResult<IActionResult>(Forbid());
    [HttpGet("summary/resident/{village}"), Authorize(Roles = "Resident")]
    public async Task<IActionResult> Summary(string village) {
        if (!User.CanReadResidentVillage(village)) return Forbid();
        return Ok(new { totalDocuments = await database.DocumentNotices.CountAsync(item => item.Village == village && item.IsVisibleToResidents) });
>>>>>>> c89f85f6a636611279072156eddad86919e92a82
    }
    [HttpPost, Authorize(Roles = AccessRules.StaffRoles)]
    public async Task<IActionResult> Create([FromForm] DocumentWriteDto request) {
        if (!AccessRules.Villages.Contains(request.Village)) return BadRequest(new { message = "Select a village." });
        if (!User.CanManageVillage(request.Village)) return Forbid();
        var document = new DocumentNotice { Village = request.Village, CreatedByUserId = User.UserId(), CreatedAt = DateTime.UtcNow };
        await Apply(document, request);
        database.DocumentNotices.Add(document);
        await database.SaveChangesAsync();
        return Ok(new { id = document.Id, message = "Document or notice saved successfully." });
    }
    [HttpPut("{id:int}"), Authorize(Roles = AccessRules.StaffRoles)]
    public async Task<IActionResult> Update(int id, [FromForm] DocumentWriteDto request) {
        var document = await database.DocumentNotices.FindAsync(id);
        if (document is null) return NotFound();
        if (!User.CanManageVillage(document.Village)) return Forbid();
        if (request.Village.Length > 0 && request.Village != document.Village) return BadRequest(new { message = "A document cannot be moved to another village." });
        await Apply(document, request); document.UpdatedAt = DateTime.UtcNow;
        await database.SaveChangesAsync();
        return Ok(new { message = "Document updated successfully." });
    }
    [HttpPut("{id:int}/visibility"), Authorize(Roles = AccessRules.StaffRoles)]
    public async Task<IActionResult> Visibility(int id, [FromBody] bool visible) {
        var document = await database.DocumentNotices.FindAsync(id);
        if (document is null) return NotFound();
        if (!User.CanManageVillage(document.Village)) return Forbid();
        document.IsVisibleToResidents = visible; document.UpdatedAt = DateTime.UtcNow;
        await database.SaveChangesAsync();
        return Ok(new { message = "Visibility updated successfully." });
    }
    [HttpDelete("{id:int}"), Authorize(Roles = AccessRules.StaffRoles)]
    public async Task<IActionResult> Delete(int id) {
        var document = await database.DocumentNotices.FindAsync(id);
        if (document is null) return NotFound();
        if (!User.CanManageVillage(document.Village)) return Forbid();
        database.DocumentNotices.Remove(document);
        await database.SaveChangesAsync();
        return Ok(new { message = "Document deleted successfully." });
    }
    private async Task Apply(DocumentNotice document, DocumentWriteDto request) {
        document.Title = request.Title.Trim(); document.Type = request.Type; document.Description = request.Description.Trim();
        document.IsVisibleToResidents = request.IsVisibleToResidents;
        if (request.File is not null) {
            document.FileUrl = await uploads.Save(request.File, "documents");
            document.FileName = Path.GetFileName(request.File.FileName);
        }
    }
}
