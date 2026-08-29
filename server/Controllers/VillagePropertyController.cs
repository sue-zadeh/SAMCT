using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;
using server.Security;

namespace server.Controllers;

[ApiController]
[Route("api/village-properties")]
public class VillagePropertyController(
    AppDbContext context,
    IWebHostEnvironment environment) : ControllerBase
{
    private const long MaxFileBytes = 10 * 1024 * 1024;

    private static readonly HashSet<string> DocumentExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png" };

    private static readonly HashSet<string> ImageExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp" };

    [HttpGet("{village}")]
    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    public async Task<IActionResult> GetByVillage(string village)
    {
        var decodedVillage = DecodeVillage(village);
        if (!User.CanAccessVillage(decodedVillage)) return Forbid();

        return Ok(await context.VillageProperties
            .AsNoTracking()
            .Where(property => property.Village == decodedVillage)
            .OrderBy(property => property.UnitNumber)
            .ToListAsync());
    }

    [HttpGet("admin/all")]
    [Authorize(Policy = SecurityPolicies.AdminOnly)]
    public async Task<IActionResult> GetAllForAdmin()
    {
        return Ok(await context.VillageProperties
            .AsNoTracking()
            .OrderBy(property => property.Village)
            .ThenBy(property => property.UnitNumber)
            .ToListAsync());
    }

    [HttpGet("marketing")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMarketingProperties()
    {
        // The public response is deliberately allow-listed. Resident names,
        // email addresses, occupations, notes and private documents never leave.
        var data = await context.VillageProperties
            .AsNoTracking()
            .Where(property => property.IsVisibleOnMarketing)
            .OrderBy(property => property.Village)
            .ThenBy(property => property.UnitNumber)
            .Select(property => new
            {
                property.Id,
                property.Village,
                property.UnitNumber,
                property.Address,
                property.MarketingTitle,
                property.MarketingDescription,
                property.MarketingImageUrl1,
                property.MarketingImageUrl2,
                property.MarketingImageUrl3,
                property.MarketingImageUrl4,
                property.MarketingImageUrl5
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpPost]
    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    [RequestSizeLimit(60 * 1024 * 1024)]
    public async Task<IActionResult> Create()
    {
        var form = await Request.ReadFormAsync();
        var village = form["village"].ToString().Trim();
        if (!User.CanAccessVillage(village)) return Forbid();

        var validationError = ValidateForm(form);
        if (validationError is not null) return BadRequest(new { message = validationError });

        var property = new VillageProperty
        {
            Village = village,
            UnitNumber = form["unitNumber"].ToString().Trim(),
            Address = form["address"].ToString().Trim(),
            ResidentCount = ParseResidentCount(form["residentCount"]),
            ResidentName = form["residentName"].ToString().Trim(),
            ResidentEmail = form["residentEmail"].ToString().Trim(),
            ResidentOccupation = form["residentOccupation"].ToString().Trim(),
            VillageManagerName = form["villageManagerName"].ToString().Trim(),
            Notes = form["notes"].ToString().Trim(),
            IsVisibleOnMarketing = ParseBoolean(form["isVisibleOnMarketing"]),
            MarketingTitle = form["marketingTitle"].ToString().Trim(),
            MarketingDescription = form["marketingDescription"].ToString().Trim(),
            CreatedAt = DateTime.UtcNow
        };

        var fileError = ValidateFiles(form.Files);
        if (fileError is not null) return BadRequest(new { message = fileError });

        await ApplyUploads(property, form.Files);
        context.VillageProperties.Add(property);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByVillage), new { village }, new
        {
            property.Id,
            message = "Village property saved successfully."
        });
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    [RequestSizeLimit(60 * 1024 * 1024)]
    public async Task<IActionResult> Update(int id)
    {
        var property = await context.VillageProperties.FindAsync(id);
        if (property is null) return NotFound(new { message = "Property not found." });
        if (!User.CanAccessVillage(property.Village)) return Forbid();

        var form = await Request.ReadFormAsync();
        var validationError = ValidateForm(form);
        if (validationError is not null) return BadRequest(new { message = validationError });

        var fileError = ValidateFiles(form.Files);
        if (fileError is not null) return BadRequest(new { message = fileError });

        property.UnitNumber = form["unitNumber"].ToString().Trim();
        property.Address = form["address"].ToString().Trim();
        property.ResidentCount = ParseResidentCount(form["residentCount"]);
        property.ResidentName = form["residentName"].ToString().Trim();
        property.ResidentEmail = form["residentEmail"].ToString().Trim();
        property.ResidentOccupation = form["residentOccupation"].ToString().Trim();
        property.VillageManagerName = form["villageManagerName"].ToString().Trim();
        property.Notes = form["notes"].ToString().Trim();
        property.IsVisibleOnMarketing = ParseBoolean(form["isVisibleOnMarketing"]);
        property.MarketingTitle = form["marketingTitle"].ToString().Trim();
        property.MarketingDescription = form["marketingDescription"].ToString().Trim();
        property.UpdatedAt = DateTime.UtcNow;

        await ApplyUploads(property, form.Files);
        await context.SaveChangesAsync();

        return Ok(new { message = "Village property updated successfully." });
    }

    [HttpPut("{id:int}/marketing-visibility")]
    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    public async Task<IActionResult> UpdateMarketingVisibility(
        int id,
        [FromBody] MarketingVisibilityDto request)
    {
        var property = await context.VillageProperties.FindAsync(id);
        if (property is null) return NotFound(new { message = "Property not found." });
        if (!User.CanAccessVillage(property.Village)) return Forbid();

        property.IsVisibleOnMarketing = request.IsVisibleOnMarketing;
        property.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return Ok(new { message = "Marketing visibility updated successfully." });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    public async Task<IActionResult> Delete(int id)
    {
        var property = await context.VillageProperties.FindAsync(id);
        if (property is null) return NotFound(new { message = "Property not found." });
        if (!User.CanAccessVillage(property.Village)) return Forbid();

        context.VillageProperties.Remove(property);
        await context.SaveChangesAsync();
        return Ok(new { message = "Village property deleted successfully." });
    }

    private static string? ValidateForm(IFormCollection form)
    {
        if (!ValidText(form["unitNumber"], 50) || !ValidText(form["address"], 250))
        {
            return "Unit number and address are required.";
        }

        if (form["residentName"].ToString().Length > 150 ||
            form["residentEmail"].ToString().Length > 254 ||
            form["residentOccupation"].ToString().Length > 150 ||
            form["villageManagerName"].ToString().Length > 150 ||
            form["notes"].ToString().Length > 4_000 ||
            form["marketingTitle"].ToString().Length > 150 ||
            form["marketingDescription"].ToString().Length > 2_000)
        {
            return "One or more fields exceed the maximum allowed length.";
        }

        return null;
    }

    private static string? ValidateFiles(IFormFileCollection files)
    {
        foreach (var file in files)
        {
            if (file.Length <= 0 || file.Length > MaxFileBytes)
            {
                return "Each uploaded file must be smaller than 10 MB.";
            }

            var isMarketing = file.Name.StartsWith("marketingImage", StringComparison.OrdinalIgnoreCase);
            var allowed = isMarketing ? ImageExtensions : DocumentExtensions;
            var extension = Path.GetExtension(file.FileName);
            if (!allowed.Contains(extension))
            {
                return "One or more uploaded file types are not allowed.";
            }

            if (isMarketing && !file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                return "Marketing uploads must be images.";
            }
        }

        return null;
    }

    private async Task ApplyUploads(VillageProperty property, IFormFileCollection files)
    {
        property.DocumentUrl1 = await SaveIfPresent(files.GetFile("document1"), "village-properties")
            ?? property.DocumentUrl1;
        property.DocumentUrl2 = await SaveIfPresent(files.GetFile("document2"), "village-properties")
            ?? property.DocumentUrl2;

        property.MarketingImageUrl1 = await SaveIfPresent(files.GetFile("marketingImage1"), "marketing")
            ?? property.MarketingImageUrl1;
        property.MarketingImageUrl2 = await SaveIfPresent(files.GetFile("marketingImage2"), "marketing")
            ?? property.MarketingImageUrl2;
        property.MarketingImageUrl3 = await SaveIfPresent(files.GetFile("marketingImage3"), "marketing")
            ?? property.MarketingImageUrl3;
        property.MarketingImageUrl4 = await SaveIfPresent(files.GetFile("marketingImage4"), "marketing")
            ?? property.MarketingImageUrl4;
        property.MarketingImageUrl5 = await SaveIfPresent(files.GetFile("marketingImage5"), "marketing")
            ?? property.MarketingImageUrl5;
    }

    private async Task<string?> SaveIfPresent(IFormFile? file, string folderName)
    {
        if (file is null) return null;

        var webRoot = environment.WebRootPath ??
            Path.Combine(environment.ContentRootPath, "wwwroot");
        var folder = Path.Combine(webRoot, "uploads", folderName);
        Directory.CreateDirectory(folder);

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var serverFileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(folder, serverFileName);

        await using var stream = new FileStream(
            filePath,
            FileMode.CreateNew,
            FileAccess.Write,
            FileShare.None);
        await file.CopyToAsync(stream);

        return $"/uploads/{folderName}/{serverFileName}";
    }

    private static string DecodeVillage(string village) =>
        Uri.UnescapeDataString(village).Trim();

    private static bool ParseBoolean(string value) =>
        bool.TryParse(value, out var parsed) && parsed;

    private static int ParseResidentCount(string value) =>
        int.TryParse(value, out var count) ? Math.Clamp(count, 0, 20) : 0;

    private static bool ValidText(string value, int maxLength) =>
        !string.IsNullOrWhiteSpace(value) && value.Trim().Length <= maxLength;
}
