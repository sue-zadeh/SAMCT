using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/village-properties")]
    public class VillagePropertyController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public VillagePropertyController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet("{village}")]
        public async Task<IActionResult> GetByVillage(string village)
        {
            var decodedVillage = Uri.UnescapeDataString(village).Trim();

            var data = await _context.VillageProperties
                .Where(v => v.Village == decodedVillage)
                .OrderBy(v => v.UnitNumber)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var data = await _context.VillageProperties
                .OrderBy(v => v.Village)
                .ThenBy(v => v.UnitNumber)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("marketing")]
        public async Task<IActionResult> GetMarketingProperties()
        {
            var data = await _context.VillageProperties
                .Where(v => v.IsVisibleOnMarketing)
                .OrderBy(v => v.Village)
                .ThenBy(v => v.UnitNumber)
                .ToListAsync();

            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Create()
        {
            var form = Request.Form;

            var property = new VillageProperty
            {
                Village = form["village"].ToString(),
                UnitNumber = form["unitNumber"].ToString(),
                Address = form["address"].ToString(),
                ResidentCount = int.TryParse(form["residentCount"], out var count) ? count : 1,
                ResidentName = form["residentName"].ToString(),
                ResidentEmail = form["residentEmail"].ToString(),
                ResidentOccupation = form["residentOccupation"].ToString(),
                VillageManagerName = form["villageManagerName"].ToString(),
                Notes = form["notes"].ToString(),
                IsVisibleOnMarketing = form["isVisibleOnMarketing"] == "true",
                MarketingTitle = form["marketingTitle"].ToString(),
                MarketingDescription = form["marketingDescription"].ToString(),
                CreatedAt = DateTime.UtcNow
            };

            property.DocumentUrl1 = await SaveFile(form.Files["document1"]);
            property.DocumentUrl2 = await SaveFile(form.Files["document2"]);

            _context.VillageProperties.Add(property);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Village property saved successfully." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id)
        {
            var property = await _context.VillageProperties.FindAsync(id);

            if (property == null)
            {
                return NotFound(new { message = "Property not found." });
            }

            var form = Request.Form;

            property.UnitNumber = form["unitNumber"].ToString();
            property.Address = form["address"].ToString();
            property.ResidentCount = int.TryParse(form["residentCount"], out var count) ? count : 1;
            property.ResidentName = form["residentName"].ToString();
            property.ResidentEmail = form["residentEmail"].ToString();
            property.ResidentOccupation = form["residentOccupation"].ToString();
            property.VillageManagerName = form["villageManagerName"].ToString();
            property.Notes = form["notes"].ToString();
            property.IsVisibleOnMarketing = form["isVisibleOnMarketing"] == "true";
            property.MarketingTitle = form["marketingTitle"].ToString();
            property.MarketingDescription = form["marketingDescription"].ToString();
            property.UpdatedAt = DateTime.UtcNow;

            var file1 = await SaveFile(form.Files["document1"]);
            var file2 = await SaveFile(form.Files["document2"]);

            if (!string.IsNullOrWhiteSpace(file1)) property.DocumentUrl1 = file1;
            if (!string.IsNullOrWhiteSpace(file2)) property.DocumentUrl2 = file2;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Village property updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var property = await _context.VillageProperties.FindAsync(id);

            if (property == null)
            {
                return NotFound(new { message = "Property not found." });
            }

            _context.VillageProperties.Remove(property);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Village property deleted successfully." });
        }

        private async Task<string> SaveFile(IFormFile? file)
        {
            if (file == null || file.Length == 0) return "";

            var folder = Path.Combine(_env.WebRootPath, "uploads", "village-properties");
            Directory.CreateDirectory(folder);

            var fileName = $"{Guid.NewGuid()}-{file.FileName}";
            var filePath = Path.Combine(folder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return $"/uploads/village-properties/{fileName}";
        }
    }
}