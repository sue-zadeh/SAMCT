using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Security;

namespace server.Controllers;

[ApiController]
[Route("api/marketing-content")]
[Authorize(Roles = AccessRules.StaffRoles)]
public class MarketingContentController(AppDbContext database, UploadStorage uploads) : ControllerBase
{
    [HttpGet, AllowAnonymous]
    public async Task<IActionResult> Published() => Ok(await database.MarketingContents.AsNoTracking()
        .Where(content => content.IsPublished).OrderBy(content => content.DisplayOrder)
        .Select(content => new {
            content.Id, content.Village, content.Kind, content.Title, content.Description,
            content.Address, content.Images, content.PriceNzd, content.Availability, content.SourceLabel
        }).ToListAsync());

    [HttpGet("manage/{village}")]
    public async Task<IActionResult> Manage(string village)
    {
        if (!User.CanManageVillage(village)) return Forbid();
        return Ok(await database.MarketingContents.AsNoTracking().Where(content => content.Village == village)
            .OrderBy(content => content.DisplayOrder).ToListAsync());
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromForm] MarketingContentWriteDto request)
    {
        var content = await database.MarketingContents.FindAsync(id);
        if (content is null) return NotFound();
        if (!User.CanManageVillage(content.Village)) return Forbid();
        // Only keep images already owned by this entry; URLs cannot be used to publish another entry's files.
        if (request.RetainedImages.Count + request.Photos.Count > 10 ||
            request.RetainedImages.Distinct().Count() != request.RetainedImages.Count ||
            request.RetainedImages.Any(image => !content.Images.Contains(image)))
            return BadRequest(new { message = "Keep or upload at most 10 photos belonging to this entry." });
        var images = new List<string>(request.RetainedImages);
        foreach (var photo in request.Photos)
            images.Add(await uploads.Save(photo, "marketing", imagesOnly: true));
        content.Title = request.Title.Trim();
        content.Description = request.Description.Trim();
        content.Address = request.Address.Trim();
        content.PriceNzd = content.Kind == "unit" ? request.PriceNzd : null;
        content.Availability = content.Kind == "unit" ? request.Availability : "Enquire";
        content.SourceLabel = request.SourceLabel.Trim();
        content.IsPublished = request.IsPublished;
        content.Images = images.ToArray();
        content.UpdatedAt = DateTime.UtcNow;
        await database.SaveChangesAsync();
        return Ok(new { message = "Marketing content saved." });
    }
}
