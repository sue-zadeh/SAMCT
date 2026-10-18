using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;
using server.Security;

namespace server.Controllers;

[ApiController]
[Route("api/marketing-content")]
[Authorize(Roles = AccessRules.StaffRoles)]
public class MarketingContentController(AppDbContext database, UploadStorage uploads) : ControllerBase
{
    // The public endpoint returns only content deliberately published by staff.
    [HttpGet, AllowAnonymous]
    public async Task<IActionResult> Published() => Ok(await database.MarketingContents.AsNoTracking()
        .Where(content => content.IsPublished).OrderBy(content => content.DisplayOrder)
        .Select(content => new {
            content.Id, content.Village, content.Kind, content.Title, content.Description,
            content.Address, content.Images, content.PriceNzd, content.Availability, content.SourceLabel,
            content.ContactName, content.ContactPhone
        }).ToListAsync());

    // Managers can access only their village; admins can access both villages.
    [HttpGet("manage/{village}")]
    public async Task<IActionResult> Manage(string village)
    {
        if (!User.CanManageVillage(village)) return Forbid();
        return Ok(await database.MarketingContents.AsNoTracking().Where(content => content.Village == village)
            .OrderBy(content => content.DisplayOrder).ToListAsync());
    }

    // Existing brochure update functionality is retained.
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromForm] MarketingContentWriteDto request)
    {
        var content = await database.MarketingContents.FindAsync(id);
        if (content is null) return NotFound();
        if (!User.CanManageVillage(content.Village)) return Forbid();
        if (request.RetainedImages.Count + request.Photos.Count > 30 ||
            request.RetainedImages.Distinct().Count() != request.RetainedImages.Count ||
            request.RetainedImages.Any(image => !content.Images.Contains(image)))
            return BadRequest(new { message = "Keep at most 30 images belonging to this entry and upload at most 10 new photos at a time." });
        var images = new List<string>(request.RetainedImages);
        foreach (var photo in request.Photos)
            images.Add(await uploads.Save(photo, "marketing", imagesOnly: true));
        content.Title = request.Title.Trim();
        content.Description = request.Description.Trim();
        content.Address = request.Address.Trim();
        content.ContactName = request.ContactName.Trim();
        content.ContactPhone = request.ContactPhone.Trim();
        content.PriceNzd = content.Kind == "unit" ? request.PriceNzd : null;
        content.Availability = content.Kind == "unit" ? request.Availability : "Enquire";
        content.SourceLabel = request.SourceLabel.Trim();
        content.IsPublished = request.IsPublished;
        content.Images = images.ToArray();
        content.UpdatedAt = DateTime.UtcNow;
        await database.SaveChangesAsync();
        return Ok(new { message = "Marketing content saved." });
    }

    // A checkbox updates publication only, not the entire brochure entry.
    [HttpPut("{id:int}/publication")]
    public async Task<IActionResult> SetPublication(int id, [FromBody] PublicationDto request)
    {
        var content = await database.MarketingContents.FindAsync(id);
        if (content is null) return NotFound();
        if (!User.CanManageVillage(content.Village)) return Forbid();
        if (content.Kind != "unit") return BadRequest(new { message = "Only individual home adverts can be changed here." });
        if (request.IsPublished && (string.IsNullOrWhiteSpace(content.Title) || string.IsNullOrWhiteSpace(content.Description)))
            return BadRequest(new { message = "Complete the public title and description before publishing." });
        content.IsPublished = request.IsPublished;
        content.UpdatedAt = DateTime.UtcNow;
        await database.SaveChangesAsync();
        return Ok(new { message = "Publication updated." });
    }

    // New FAQ. Nothing is added to the database until staff submits it.
    [HttpPost("faqs")]
    public async Task<IActionResult> CreateFaq([FromBody] FaqWriteDto request)
    {
        if (!AccessRules.Villages.Contains(request.Village)) return BadRequest(new { message = "Invalid village." });
        if (!User.CanManageVillage(request.Village)) return Forbid();
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description) || string.IsNullOrWhiteSpace(request.SourceLabel))
            return BadRequest(new { message = "Enter a question, answer and source." });
        var nextOrder = (await database.MarketingContents.Where(item => item.Village == request.Village)
            .MaxAsync(item => (int?)item.DisplayOrder) ?? 0) + 1;
        var faq = new MarketingContent {
            Kind = "faq", Village = request.Village,
            Slug = $"faq-{Guid.NewGuid():N}",
            Title = request.Title.Trim(), Description = request.Description.Trim(),
            SourceLabel = request.SourceLabel.Trim(),
            IsPublished = request.IsPublished, DisplayOrder = nextOrder,
            UpdatedAt = DateTime.UtcNow
        };
        database.MarketingContents.Add(faq);
        await database.SaveChangesAsync();
        return Created($"/api/marketing-content/faqs/{faq.Id}", new { faq.Id });
    }

    // Edit FAQ only; this cannot change its village or type.
    [HttpPut("faqs/{id:int}")]
    public async Task<IActionResult> UpdateFaq(int id, [FromBody] FaqWriteDto request)
    {
        var faq = await database.MarketingContents.FindAsync(id);
        if (faq is null || faq.Kind != "faq") return NotFound();
        if (!User.CanManageVillage(faq.Village)) return Forbid();
        if (request.Village != faq.Village) return BadRequest(new { message = "Cannot move an FAQ to another village." });
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description) || string.IsNullOrWhiteSpace(request.SourceLabel))
            return BadRequest(new { message = "Enter a question, answer and source." });
        faq.Title = request.Title.Trim();
        faq.Description = request.Description.Trim();
        faq.SourceLabel = request.SourceLabel.Trim();
        faq.IsPublished = request.IsPublished;
        faq.UpdatedAt = DateTime.UtcNow;
        await database.SaveChangesAsync();
        return Ok(new { message = "FAQ updated." });
    }

    // Delete FAQ by id, never other marketing records.
    [HttpDelete("faqs/{id:int}")]
    public async Task<IActionResult> DeleteFaq(int id)
    {
        var faq = await database.MarketingContents.FindAsync(id);
        if (faq is null || faq.Kind != "faq") return NotFound();
        if (!User.CanManageVillage(faq.Village)) return Forbid();
        database.MarketingContents.Remove(faq);
        await database.SaveChangesAsync();
        return Ok(new { message = "FAQ deleted." });
    }
}
