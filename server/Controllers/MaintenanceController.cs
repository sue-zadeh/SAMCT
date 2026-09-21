using Microsoft.AspNetCore.Authorization;
using server.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/maintenance")]
    public class MaintenanceController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UploadStorage _uploads;

        public MaintenanceController(AppDbContext context, UploadStorage uploads)
        {
            _context = context;
            _uploads = uploads;
        }

        [Authorize(Roles = "Resident")]
        [HttpGet("resident/{userName}")]
        public async Task<IActionResult> GetResidentRequests(string userName)
        {
            if (!User.IsSelf(userName)) return Forbid();
            var requests = await _context.MaintenanceRequests
                .Include(r => r.User)
                .Where(r => r.User != null && r.User.UserName == userName)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    ResidentName = r.User != null ? r.User.FullName : "",
                    ResidentUserName = r.User != null ? r.User.UserName : "",
                    r.Title,
                    r.Description,
                    r.UnitOrAddress,
                    r.Priority,
                    r.Status,
                    r.Village,
                    r.ManagerAnswer,
                    r.ImageUrl1,
                    r.ImageUrl2,
                    r.CreatedAt,
                    r.UpdatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        [Authorize(Roles = "Resident")]
        [HttpPost("resident")]
        public async Task<IActionResult> CreateResidentMaintenance([FromForm] CreateMaintenanceRequestDto request)
        {
            var user = await _context.Users.SingleAsync(item => item.Id == User.UserId());
            if (!User.IsSelf(request.UserName) || request.Village != user.Village) return Forbid();
            var imageUrl1 = await _uploads.Save(request.Image1, "maintenance", imagesOnly: true);
            var imageUrl2 = await _uploads.Save(request.Image2, "maintenance", imagesOnly: true);

            var maintenance = new MaintenanceRequest
            {
                UserId = user.Id,
                Village = user.Village,
                Title = request.Title,
                Description = request.Description,
                UnitOrAddress = request.UnitOrAddress,
                Priority = request.Priority,
                Status = "Pending",
                ImageUrl1 = imageUrl1,
                ImageUrl2 = imageUrl2,
                CreatedAt = DateTime.UtcNow,
                IsReadByManager = false,
                IsReadByResident = true
            };

            _context.MaintenanceRequests.Add(maintenance);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Maintenance request submitted successfully." });
        }

        [Authorize(Roles = "VillageManager")]
        [HttpGet("village/{village}")]
        public async Task<IActionResult> GetVillageRequests(string village)
        {
            var decodedVillage = village;
            if (!User.CanManageVillage(decodedVillage)) return Forbid();

            var requests = await _context.MaintenanceRequests
                .Include(r => r.User)
                .Where(r => r.Village == decodedVillage)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    ResidentName = r.User != null ? r.User.FullName : "",
                    ResidentUserName = r.User != null ? r.User.UserName : "",
                    r.Title,
                    r.Description,
                    r.UnitOrAddress,
                    r.Priority,
                    r.Status,
                    r.Village,
                    r.ManagerAnswer,
                    r.ImageUrl1,
                    r.ImageUrl2,
                    r.CreatedAt,
                    r.UpdatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        [Authorize(Roles = "VillageManager")]
        [HttpPut("{id}/manager-response")]
        public async Task<IActionResult> UpdateManagerResponse(
            int id,
            [FromBody] UpdateMaintenanceRequestDto request
        )
        {
            var maintenance = await _context.MaintenanceRequests.FindAsync(id);

            if (maintenance == null)
                return NotFound(new { message = "Maintenance request not found." });

            if (!User.CanManageVillage(maintenance.Village)) return Forbid();
            if (!string.IsNullOrEmpty(request.ManagerUserName) && !User.IsSelf(request.ManagerUserName)) return Forbid();
            maintenance.ManagerAnswer = request.ManagerAnswer;
            maintenance.Status = request.Status;
            maintenance.UpdatedAt = DateTime.UtcNow;
            maintenance.IsReadByResident = false;
            maintenance.IsReadByManager = true;

            maintenance.HandledById = User.UserId();

            await _context.SaveChangesAsync();

            return Ok(new { message = "Maintenance request updated successfully." });
        }

        [Authorize(Roles = "Resident")]
        [HttpGet("summary/resident/{userName}")]
        public async Task<IActionResult> GetResidentSummary(string userName)
        {
            if (!User.IsSelf(userName)) return Forbid();
            var requests = _context.MaintenanceRequests
                .Include(r => r.User)
                .Where(r => r.User != null && r.User.UserName == userName);

            return Ok(new
            {
                totalRequests = await requests.CountAsync(),
                pending = await requests.CountAsync(r => r.Status == "Pending"),
                inProgress = await requests.CountAsync(r => r.Status == "In Progress"),
                completed = await requests.CountAsync(r => r.Status == "Completed")
            });
        }

        [Authorize(Roles = "VillageManager")]
        [HttpGet("summary/village/{village}")]
        public async Task<IActionResult> GetVillageSummary(string village)
        {
            var decodedVillage = village;
            if (!User.CanManageVillage(decodedVillage)) return Forbid();

            var requests = await _context.MaintenanceRequests
                .Where(r => r.Village == decodedVillage)
                .ToListAsync();

            return Ok(new
            {
                openMaintenanceCount = requests.Count(item => item.Status != "Completed"),
                pending = requests.Count(r => r.Status == "Pending"),
                inProgress = requests.Count(r => r.Status == "In Progress"),
                completed = requests.Count(r => r.Status == "Completed")
            });
        }

        [Authorize(Roles = AccessRules.AdminRoles)]
        [HttpGet("summary/admin")]
        public async Task<IActionResult> GetAdminSummary()
        {
            var villages = new[] {"Ngatea", "Whitianga" };
            var result = new List<object>();

            foreach (var village in villages)
            {
                var requests = await _context.MaintenanceRequests
                    .Where(r => r.Village == village)
                    .ToListAsync();

                result.Add(new
                {
                    village,
                    total = requests.Count,
                    pending = requests.Count(r => r.Status == "Pending"),
                    inProgress = requests.Count(r => r.Status == "In Progress"),
                    completed = requests.Count(r => r.Status == "Completed")
                });
            }

            return Ok(result);
        }
    }
}