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

        [HttpGet("summary/admin")]
        public async Task<IActionResult> GetAdminMaintenanceSummary()
        {
            var summary = await _context.MaintenanceRequests
                .GroupBy(m => m.Village)
                .Select(g => new
                {
                    village = g.Key,
                    total = g.Count(),
                    pending = g.Count(x => x.Status == "Pending"),
                    inProgress = g.Count(x => x.Status == "In Progress"),
                    completed = g.Count(x => x.Status == "Completed")
                })
                .ToListAsync();

            return Ok(summary);
        }

        [HttpGet("summary/village/{village}")]
        public async Task<IActionResult> GetVillageMaintenanceSummary(string village)
        {
            var requests = _context.MaintenanceRequests
                .Where(m => m.Village == village);

            var summary = new
            {
                total = await requests.CountAsync(),
                pending = await requests.CountAsync(x => x.Status == "Pending"),
                inProgress = await requests.CountAsync(x => x.Status == "In Progress"),
                completed = await requests.CountAsync(x => x.Status == "Completed")
            };

            return Ok(summary);
        }

        [HttpGet("summary/resident/{username}")]
        public async Task<IActionResult> GetResidentMaintenanceSummary(string username)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == username);

            if (user == null)
            {
                return NotFound(new { message = "Resident user not found." });
            }

            var requests = _context.MaintenanceRequests
                .Where(m => m.UserId == user.Id);

            var summary = new
            {
                total = await requests.CountAsync(),
                pending = await requests.CountAsync(x => x.Status == "Pending"),
                inProgress = await requests.CountAsync(x => x.Status == "In Progress"),
                completed = await requests.CountAsync(x => x.Status == "Completed"),
                newResponses = await requests.CountAsync(x =>
                    x.IsReadByResident == false &&
                    !string.IsNullOrEmpty(x.ManagerAnswer))
            };

            return Ok(summary);
        }
    }
}