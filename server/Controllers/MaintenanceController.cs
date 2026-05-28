using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/maintenance")]
    public class MaintenanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MaintenanceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("resident/{userName}")]
        public async Task<IActionResult> GetResidentRequests(string userName)
        {
            var requests = await _context.MaintenanceRequests
                .Include(r => r.User)
                .Where(r => r.User != null && r.User.UserName == userName)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    ResidentName = r.User!.FullName,
                    ResidentUserName = r.User.UserName,
                    r.Title,
                    r.Description,
                    r.UnitOrAddress,
                    r.Priority,
                    r.Status,
                    r.Village,
                    r.ManagerAnswer,
                    r.CreatedAt,
                    r.UpdatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPost("resident")]
        public async Task<IActionResult> CreateResidentRequest([FromBody] CreateMaintenanceRequestDto request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == request.UserName && u.IsActive);

            if (user == null)
            {
                return NotFound(new { message = "Resident user not found." });
            }

            var maintenance = new MaintenanceRequest
            {
                UserId = user.Id,
                Village = string.IsNullOrWhiteSpace(request.Village) ? user.Village : request.Village,
                Title = request.Title,
                Description = request.Description,
                UnitOrAddress = request.UnitOrAddress,
                Priority = request.Priority,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                IsReadByResident = true,
                IsReadByManager = false
            };

            _context.MaintenanceRequests.Add(maintenance);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Maintenance request submitted successfully." });
        }

        [HttpGet("village/{village}")]
        public async Task<IActionResult> GetVillageRequests(string village)
        {
            var decodedVillage = Uri.UnescapeDataString(village);

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
                    r.CreatedAt,
                    r.UpdatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPut("{id}/manager-response")]
        public async Task<IActionResult> UpdateManagerResponse(int id, [FromBody] UpdateMaintenanceRequestDto request)
        {
            var maintenance = await _context.MaintenanceRequests.FindAsync(id);

            if (maintenance == null)
            {
                return NotFound(new { message = "Maintenance request not found." });
            }

            var manager = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == request.ManagerUserName && u.IsActive);

            maintenance.ManagerAnswer = request.ManagerAnswer;
            maintenance.Status = request.Status;
            maintenance.UpdatedAt = DateTime.UtcNow;
            maintenance.IsReadByResident = false;
            maintenance.IsReadByManager = true;

            if (manager != null)
            {
                maintenance.HandledById = manager.Id;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Maintenance request updated successfully." });
        }

        [HttpGet("summary/resident/{userName}")]
        public async Task<IActionResult> GetResidentSummary(string userName)
        {
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

         [HttpGet("summary/village/{village}")]
         public async Task<IActionResult> GetVillageSummary(string village)
         {
             var decodedVillage = Uri.UnescapeDataString(village);

             var requests = await _context.MaintenanceRequests
                 .Where(r => r.Village == decodedVillage)
                 .ToListAsync();

             return Ok(new
             {
                 openMaintenanceCount = requests.Count,
                 pending = requests.Count(r => r.Status == "Pending"),
                 inProgress = requests.Count(r => r.Status == "In Progress"),
                 completed = requests.Count(r => r.Status == "Completed")
             });
         } 
   }
}