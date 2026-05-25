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

        [HttpPost("resident")]
        public async Task<IActionResult> CreateRequest(
            [FromBody] CreateMaintenanceRequestDto request
        )
        {
            if (
                string.IsNullOrWhiteSpace(request.UserName) ||
                string.IsNullOrWhiteSpace(request.Title) ||
                string.IsNullOrWhiteSpace(request.Description)
            )
            {
                return BadRequest(new { message = "Title and description are required." });
            }

            var resident = await _context.Users.FirstOrDefaultAsync(
                u => u.UserName == request.UserName.Trim() && u.IsActive
            );

            if (resident == null)
            {
                return NotFound(new { message = "Resident not found or inactive." });
            }

            var maintenance = new MaintenanceRequest
            {
                UserId = resident.Id,
                Village = resident.Village,
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                UnitOrAddress = request.UnitOrAddress?.Trim() ?? "",
                Priority = request.Priority?.Trim() ?? "Normal",
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                IsReadByResident = true,
                IsReadByManager = false
            };

            _context.MaintenanceRequests.Add(maintenance);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Maintenance request submitted successfully.",
                request = maintenance
            });
        }

        [HttpGet("resident/{username}")]
        public async Task<IActionResult> GetResidentRequests(string username)
        {
            var resident = await _context.Users.FirstOrDefaultAsync(
                u => u.UserName == username.Trim()
            );

            if (resident == null)
            {
                return NotFound(new { message = "Resident not found." });
            }

            var requests = await _context.MaintenanceRequests
                .Where(r => r.UserId == resident.Id)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.Title,
                    r.Description,
                    r.UnitOrAddress,
                    r.Priority,
                    r.Status,
                    r.ManagerAnswer,
                    r.CreatedAt,
                    r.UpdatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpGet("village/{village}")]
        public async Task<IActionResult> GetVillageRequests(string village)
        {
            var decodedVillage = Uri.UnescapeDataString(village).Trim();

            var requests = await _context.MaintenanceRequests
                .Include(r => r.User)
                .Where(r => r.Village == decodedVillage)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    ResidentName = r.User != null ? r.User.FullName : "Unknown resident",
                    ResidentUserName = r.User != null ? r.User.UserName : "",
                    r.Title,
                    r.Description,
                    r.UnitOrAddress,
                    r.Priority,
                    r.Status,
                    r.ManagerAnswer,
                    r.Village,
                    r.CreatedAt,
                    r.UpdatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPut("{id}/manager-response")]
        public async Task<IActionResult> UpdateManagerResponse(
            int id,
            [FromBody] UpdateMaintenanceRequestDto request
        )
        {
            if (string.IsNullOrWhiteSpace(request.ManagerUserName))
            {
                return BadRequest(new { message = "Manager username is required." });
            }

            if (string.IsNullOrWhiteSpace(request.ManagerAnswer))
            {
                return BadRequest(new { message = "Manager answer is required." });
            }

            var manager = await _context.Users.FirstOrDefaultAsync(
                u => u.UserName == request.ManagerUserName.Trim() && u.IsActive
            );

            if (manager == null)
            {
                return NotFound(new { message = "Manager not found or inactive." });
            }

            var maintenance = await _context.MaintenanceRequests
                .FirstOrDefaultAsync(r => r.Id == id);

            if (maintenance == null)
            {
                return NotFound(new { message = "Maintenance request not found." });
            }

            if (
                manager.Role == "VillageManager" &&
                maintenance.Village != manager.Village
            )
            {
                return BadRequest(new
                {
                    message = "You can only manage requests from your own village."
                });
            }

            maintenance.ManagerAnswer = request.ManagerAnswer.Trim();
            maintenance.Status = request.Status.Trim();
            maintenance.HandledById = manager.Id;
            maintenance.UpdatedAt = DateTime.UtcNow;
            maintenance.IsReadByResident = false;
            maintenance.IsReadByManager = true;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Maintenance request updated successfully.",
                request = maintenance
            });
        }
    }
}