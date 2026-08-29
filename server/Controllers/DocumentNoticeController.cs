using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using server.Security;

namespace server.Controllers;

[ApiController]
[Authorize]
[Route("api/documents")]
public class DocumentNoticeController(
    AppDbContext context,
    IWebHostEnvironment environment) : ControllerBase
{
    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png"
        };

    private static readonly HashSet<string> AllowedContentTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/jpeg",
            "image/png"
        };

    private const long MaxFileBytes = 10 * 1024 * 1024;

    [HttpGet("admin")]
    [Authorize(Policy = SecurityPolicies.AdminOnly)]
    public async Task<IActionResult> GetAllDocuments()
    {
        return Ok(await ProjectDocuments(context.DocumentNotices)
            .OrderByDescending(document => document.CreatedAt)
            .ToListAsync());
    }

    [HttpGet("village/{village}")]
    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    public async Task<IActionResult> GetVillageDocuments(string village)
    {
        var decodedVillage = DecodeVillage(village);
        if (!User.CanAccessVillage(decodedVillage)) return Forbid();

        return Ok(await ProjectDocuments(context.DocumentNotices
                .Where(document => document.Village == decodedVillage))
            .OrderByDescending(document => document.CreatedAt)
            .ToListAsync());
    }

    [HttpGet("resident/{village}")]
    public async Task<IActionResult> GetResidentDocuments(string village)
    {
        var decodedVillage = DecodeVillage(village);
        if (!CanReadResidentDocuments(decodedVillage)) return Forbid();

        return Ok(await ProjectDocuments(context.DocumentNotices
                .Where(document =>
                    document.Village == decodedVillage && document.IsVisibleToResidents))
            .OrderByDescending(document => document.CreatedAt)
            .ToListAsync());
    }

    [HttpPost]
    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    [RequestSizeLimit(MaxFileBytes + 64 * 1024)]
    public async Task<IActionResult> CreateDocument(
        [FromForm] string title,
        [FromForm] string type,
        [FromForm] string description,
        [FromForm] string village,
        [FromForm] bool isVisibleToResidents,
        IFormFile? file)
    {
        village = village.Trim();
        if (!User.CanAccessVillage(village)) return Forbid();
        if (!ValidText(title, 150) || !ValidText(type, 50) || description.Length > 4_000)
        {
            return BadRequest(new { message = "Document details are invalid." });
        }

        var uploadError = ValidateFile(file);
        if (uploadError is not null) return BadRequest(new { message = uploadError });

        var document = new DocumentNotice
        {
            Title = title.Trim(),
            Type = type.Trim(),
            Description = description.Trim(),
            Village = village,
            IsVisibleToResidents = isVisibleToResidents,
            CreatedByUserId = User.GetUserId(),
            CreatedAt = DateTime.UtcNow
        };

        if (file is not null)
        {
            document.FileUrl = await SaveFile(file);
            document.FileName = Path.GetFileName(file.FileName);
        }

        context.DocumentNotices.Add(document);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVillageDocuments), new { village }, new
        {
            document.Id,
            message = "Document or notice saved successfully."
        });
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    [RequestSizeLimit(MaxFileBytes + 64 * 1024)]
    public async Task<IActionResult> UpdateDocument(
        int id,
        [FromForm] string title,
        [FromForm] string type,
        [FromForm] string description,
        [FromForm] bool isVisibleToResidents,
        IFormFile? file)
    {
        var document = await context.DocumentNotices.FindAsync(id);
        if (document is null) return NotFound(new { message = "Document not found." });
        if (!User.CanAccessVillage(document.Village)) return Forbid();
        if (!ValidText(title, 150) || !ValidText(type, 50) || description.Length > 4_000)
        {
            return BadRequest(new { message = "Document details are invalid." });
        }

        var uploadError = ValidateFile(file);
        if (uploadError is not null) return BadRequest(new { message = uploadError });

        document.Title = title.Trim();
        document.Type = type.Trim();
        document.Description = description.Trim();
        document.IsVisibleToResidents = isVisibleToResidents;
        document.UpdatedAt = DateTime.UtcNow;

        if (file is not null)
        {
            document.FileUrl = await SaveFile(file);
            document.FileName = Path.GetFileName(file.FileName);
        }

        await context.SaveChangesAsync();
        return Ok(new { message = "Document updated successfully." });
    }

    [HttpPut("{id:int}/visibility")]
    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    public async Task<IActionResult> UpdateVisibility(
        int id,
        [FromBody] bool isVisibleToResidents)
    {
        var document = await context.DocumentNotices.FindAsync(id);
        if (document is null) return NotFound(new { message = "Document not found." });
        if (!User.CanAccessVillage(document.Village)) return Forbid();

        document.IsVisibleToResidents = isVisibleToResidents;
        document.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return Ok(new { message = "Visibility updated successfully." });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    public async Task<IActionResult> DeleteDocument(int id)
    {
        var document = await context.DocumentNotices.FindAsync(id);
        if (document is null) return NotFound(new { message = "Document not found." });
        if (!User.CanAccessVillage(document.Village)) return Forbid();

        context.DocumentNotices.Remove(document);
        await context.SaveChangesAsync();
        return Ok(new { message = "Document deleted successfully." });
    }

    [HttpGet("summary/resident/{village}")]
    public async Task<IActionResult> GetResidentDocumentSummary(string village)
    {
        var decodedVillage = DecodeVillage(village);
        if (!CanReadResidentDocuments(decodedVillage)) return Forbid();

        var count = await context.DocumentNotices.CountAsync(document =>
            document.Village == decodedVillage && document.IsVisibleToResidents);

        return Ok(new { totalDocuments = count });
    }

    private bool CanReadResidentDocuments(string village) =>
        User.IsAdmin() ||
        string.Equals(User.GetVillage(), village, StringComparison.OrdinalIgnoreCase);

    private static IQueryable<object> ProjectDocuments(IQueryable<DocumentNotice> query) =>
        query.Select(document => new
        {
            document.Id,
            document.Title,
            document.Type,
            document.Description,
            document.Village,
            document.FileUrl,
            document.FileName,
            document.IsVisibleToResidents,
            CreatedBy = document.CreatedByUser != null ? document.CreatedByUser.FullName : "",
            document.CreatedAt,
            document.UpdatedAt
        });

    private static string DecodeVillage(string village) =>
        Uri.UnescapeDataString(village).Trim();

    private static bool ValidText(string value, int maxLength) =>
        !string.IsNullOrWhiteSpace(value) && value.Trim().Length <= maxLength;

    private static string? ValidateFile(IFormFile? file)
    {
        if (file is null) return null;
        if (file.Length <= 0 || file.Length > MaxFileBytes)
        {
            return "The file must be smaller than 10 MB.";
        }

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension) || !AllowedContentTypes.Contains(file.ContentType))
        {
            return "The selected file type is not allowed.";
        }

        return null;
    }

    private async Task<string> SaveFile(IFormFile file)
    {
        var webRoot = environment.WebRootPath ??
            Path.Combine(environment.ContentRootPath, "wwwroot");
        var uploadFolder = Path.Combine(webRoot, "uploads", "documents");
        Directory.CreateDirectory(uploadFolder);

        var serverFileName = $"{Guid.NewGuid():N}{Path.GetExtension(file.FileName).ToLowerInvariant()}";
        var fullPath = Path.Combine(uploadFolder, serverFileName);

        await using var stream = new FileStream(
            fullPath,
            FileMode.CreateNew,
            FileAccess.Write,
            FileShare.None);
        await file.CopyToAsync(stream);

        return $"/uploads/documents/{serverFileName}";
    }
}
