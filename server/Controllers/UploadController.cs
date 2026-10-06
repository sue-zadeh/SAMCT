using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Security;

namespace server.Controllers;

[ApiController]
[Route("uploads")]
public class UploadController(AppDbContext database, UploadStorage uploads, MalwareScanner scanner) : ControllerBase
{
    [AllowAnonymous, HttpGet("{**path}")]
    public async Task<IActionResult> Download(string path)
    {
        var url = "/uploads/" + path;
        var property = await database.VillageProperties.AsNoTracking().FirstOrDefaultAsync(item =>
            item.DocumentUrl1 == url || item.DocumentUrl2 == url || item.MarketingImageUrl1 == url ||
            item.MarketingImageUrl2 == url || item.MarketingImageUrl3 == url || item.MarketingImageUrl4 == url || item.MarketingImageUrl5 == url ||
            item.MarketingImageUrl6 == url || item.MarketingImageUrl7 == url || item.MarketingImageUrl8 == url || item.MarketingImageUrl9 == url || item.MarketingImageUrl10 == url);
        var marketingImage = property is not null && new[] {property.MarketingImageUrl1, property.MarketingImageUrl2,
            property.MarketingImageUrl3, property.MarketingImageUrl4, property.MarketingImageUrl5, property.MarketingImageUrl6, property.MarketingImageUrl7, property.MarketingImageUrl8, property.MarketingImageUrl9, property.MarketingImageUrl10}.Contains(url) && UploadStorage.IsImage(path);
        var brochure = await database.MarketingContents.AsNoTracking().FirstOrDefaultAsync(content => content.Images.Contains(url));
        var publicImage = (marketingImage && property!.IsVisibleOnMarketing) ||
            (brochure is not null && brochure.IsPublished && UploadStorage.IsImage(path));
        if (!publicImage) {
            if (User.Identity?.IsAuthenticated != true) return Unauthorized();
            var allowed = (property is not null && User.CanManageVillage(property.Village)) ||
                (brochure is not null && User.CanManageVillage(brochure.Village));
            if (!allowed) {
                var document = await database.DocumentNotices.AsNoTracking().FirstOrDefaultAsync(item => item.FileUrl == url);
                allowed = document is not null && (User.CanManageVillage(document.Village) ||
                    (document.IsVisibleToResidents && User.CanReadResidentVillage(document.Village)));
            }
            if (!allowed) {
                var maintenance = await database.MaintenanceRequests.AsNoTracking().FirstOrDefaultAsync(item => item.ImageUrl1 == url || item.ImageUrl2 == url);
                allowed = maintenance is not null && ((User.IsInRole("Resident") && maintenance.UserId == User.UserId()) ||
                    (User.IsInRole("VillageManager") && User.Village() == maintenance.Village));
            }
            if (!allowed) {
                var owner = await database.Users.AsNoTracking().FirstOrDefaultAsync(item => item.ProfileImageUrl == url);
                allowed = owner is not null && (owner.Id == User.UserId() || User.CanManageVillage(owner.Village));
            }
            if (!allowed) return NotFound();
        }
        var filePath = uploads.Resolve(path);
        if (filePath is null) return NotFound();
        // Scan downloads too: this includes files uploaded before scanning was introduced.
        await using (var scanInput = System.IO.File.OpenRead(filePath)) await scanner.Scan(scanInput);
        if (UploadStorage.IsImage(path)) {
            await using var stream = System.IO.File.OpenRead(filePath);
            await UploadStorage.ValidateSignature(stream, Path.GetExtension(path).ToLowerInvariant());
            return PhysicalFile(filePath, UploadStorage.ContentType(path));
        }
        Response.Headers.ContentSecurityPolicy = "sandbox; default-src 'none'";
        return PhysicalFile(filePath, "application/octet-stream", Path.GetFileName(path));
    }
}
