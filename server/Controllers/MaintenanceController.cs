using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;
using server.Security;

namespace server.Controllers;

[ApiController]
[Authorize]
[Route("api/maintenance")]
public class MaintenanceController(AppDbContext context, IWebHostEnvironment environment) : ControllerBase
{
    private const long MaximumImageBytes = 5 * 1024 * 1024;
    private static readonly string[] AllowedStatuses = ["Pending", "In Progress", "Completed"];
    private static readonly string[] AllowedPriorities = ["Low", "Normal", "High", "Urgent"];

    [HttpGet("resident/{userName}")]
    public async Task<IActionResult> GetResidentRequests(string userName)
    {
        if (!User.IsAdmin() &&
            !string.Equals(User.GetUserName(), userName, StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        var requests = await ResidentRequests(userName).ToListAsync();
        return Ok(requests);
    }

    [Authorize(Roles = SamctRoles.Resident)]
    [HttpPost("resident")]
    [RequestSizeLimit((2 * MaximumImageBytes) + (128 * 1024))]
    public async Task<IActionResult> CreateResidentMaintenance([FromForm] CreateMaintenanceRequestDto request)
    {
        var user = await context.Users.FirstOrDefaultAsync(candidate =>
            candidate.Id == User.GetUserId() && candidate.IsActive);
        if (user is null)
        {
            return Unauthorized();
        }

        if (string.IsNullOrWhiteSpace(request.Title) ||
            string.IsNullOrWhiteSpace(request.Description) ||
            string.IsNullOrWhiteSpace(request.UnitOrAddress))
        {
            return BadRequest(new { message = "Title, description, and unit or address are required." });
        }

        if (!AllowedPriorities.Contains(request.Priority, StringComparer.Ordinal))
        {
            return BadRequest(new { message = "Priority is not valid." });
        }

        var maintenance = new MaintenanceRequest
        {
            UserId = user.Id,
            Village = user.Village,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            UnitOrAddress = request.UnitOrAddress.Trim(),
            Priority = request.Priority,
            Status = "Pending",
            ImageUrl1 = request.Image1 is null ? "" : await SaveImage(request.Image1),
            ImageUrl2 = request.Image2 is null ? "" : await SaveImage(request.Image2),
            CreatedAt = DateTime.UtcNow,
            IsReadByManager = false,
            IsReadByResident = true
        };

        context.MaintenanceRequests.Add(maintenance);
        await context.SaveChangesAsync();

        return Created($"/api/maintenance/resident/{user.UserName}",
            new { message = "Maintenance request submitted successfully." });
    }

    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    [HttpGet("village/{village}")]
    public async Task<IActionResult> GetVillageRequests(string village)
    {
        var decodedVillage = Uri.UnescapeDataString(village).Trim();
        if (!User.CanAccessVillage(decodedVillage))
        {
            return Forbid();
        }

        var requests = await context.MaintenanceRequests
            .AsNoTracking()
            .Include(request => request.User)
            .Where(request => request.Village == decodedVillage)
            .OrderByDescending(request => request.CreatedAt)
            .Select(request => new
            {
                request.Id,
                ResidentName = request.User != null ? request.User.FullName : "",
                ResidentUserName = request.User != null ? request.User.UserName : "",
                request.Title,
                request.Description,
                request.UnitOrAddress,
                request.Priority,
                request.Status,
                request.Village,
                request.ManagerAnswer,
                request.ImageUrl1,
                request.ImageUrl2,
                request.CreatedAt,
                request.UpdatedAt
            })
            .ToListAsync();

        return Ok(requests);
    }

    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    [HttpPut("{id:int}/manager-response")]
    public async Task<IActionResult> UpdateManagerResponse(
        int id,
        [FromBody] UpdateMaintenanceRequestDto request)
    {
        var maintenance = await context.MaintenanceRequests.FindAsync(id);
        if (maintenance is null)
        {
            return NotFound(new { message = "Maintenance request not found." });
        }

        if (!User.CanAccessVillage(maintenance.Village))
        {
            return Forbid();
        }

        if (!AllowedStatuses.Contains(request.Status, StringComparer.Ordinal))
        {
            return BadRequest(new { message = "Status is not valid." });
        }

        maintenance.ManagerAnswer = request.ManagerAnswer.Trim();
        maintenance.Status = request.Status;
        maintenance.UpdatedAt = DateTime.UtcNow;
        maintenance.IsReadByResident = false;
        maintenance.IsReadByManager = true;
        maintenance.HandledById = User.GetUserId();

        await context.SaveChangesAsync();
        return Ok(new { message = "Maintenance request updated successfully." });
    }

    [HttpGet("summary/resident/{userName}")]
    public async Task<IActionResult> GetResidentSummary(string userName)
    {
        if (!User.IsAdmin() &&
            !string.Equals(User.GetUserName(), userName, StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        var requests = context.MaintenanceRequests
            .Include(request => request.User)
            .Where(request => request.User != null && request.User.UserName == userName);

        return Ok(new
        {
            totalRequests = await requests.CountAsync(),
            pending = await requests.CountAsync(request => request.Status == "Pending"),
            inProgress = await requests.CountAsync(request => request.Status == "In Progress"),
            completed = await requests.CountAsync(request => request.Status == "Completed")
        });
    }

    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    [HttpGet("summary/village/{village}")]
    public async Task<IActionResult> GetVillageSummary(string village)
    {
        var decodedVillage = Uri.UnescapeDataString(village).Trim();
        if (!User.CanAccessVillage(decodedVillage))
        {
            return Forbid();
        }

        var requests = context.MaintenanceRequests.Where(request => request.Village == decodedVillage);
        return Ok(new
        {
            openMaintenanceCount = await requests.CountAsync(),
            pending = await requests.CountAsync(request => request.Status == "Pending"),
            inProgress = await requests.CountAsync(request => request.Status == "In Progress"),
            completed = await requests.CountAsync(request => request.Status == "Completed")
        });
    }

    [Authorize(Policy = SecurityPolicies.AdminOnly)]
    [HttpGet("summary/admin")]
    public async Task<IActionResult> GetAdminSummary()
    {
        var villages = new[] { "Ngatea", "Whitianga" };
        var result = new List<object>();

        foreach (var village in villages)
        {
            var requests = context.MaintenanceRequests.Where(request => request.Village == village);
            result.Add(new
            {
                village,
                total = await requests.CountAsync(),
                pending = await requests.CountAsync(request => request.Status == "Pending"),
                inProgress = await requests.CountAsync(request => request.Status == "In Progress"),
                completed = await requests.CountAsync(request => request.Status == "Completed")
            });
        }

        return Ok(result);
    }

    private IQueryable<object> ResidentRequests(string userName) =>
        context.MaintenanceRequests
            .AsNoTracking()
            .Include(request => request.User)
            .Where(request => request.User != null && request.User.UserName == userName)
            .OrderByDescending(request => request.CreatedAt)
            .Select(request => new
            {
                request.Id,
                ResidentName = request.User != null ? request.User.FullName : "",
                ResidentUserName = request.User != null ? request.User.UserName : "",
                request.Title,
                request.Description,
                request.UnitOrAddress,
                request.Priority,
                request.Status,
                request.Village,
                request.ManagerAnswer,
                request.ImageUrl1,
                request.ImageUrl2,
                request.CreatedAt,
                request.UpdatedAt
            });

    private async Task<string> SaveImage(IFormFile file)
    {
        if (file.Length <= 0 || file.Length > MaximumImageBytes)
        {
            throw new BadHttpRequestException("Each image must be smaller than 5 MB.");
        }

        var extension = file.ContentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => throw new BadHttpRequestException("Only JPG, PNG, and WebP images are allowed.")
        };

        var webRoot = environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var uploadFolder = Path.Combine(webRoot, "uploads", "maintenance");
        Directory.CreateDirectory(uploadFolder);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        await using var stream = new FileStream(
            Path.Combine(uploadFolder, fileName), FileMode.CreateNew);
        await file.CopyToAsync(stream);
        return $"/uploads/maintenance/{fileName}";
    }
}
