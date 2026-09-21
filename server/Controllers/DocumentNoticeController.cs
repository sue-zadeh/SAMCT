using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;
using server.Security;
namespace server.Controllers;

[ApiController, Route("api/documents"), Authorize]
public class DocumentNoticeController(AppDbContext database, UploadStorage uploads) : ControllerBase
{
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
