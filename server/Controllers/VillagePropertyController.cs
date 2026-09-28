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
    [Authorize(Roles = AccessRules.StaffRoles)]
    [Route("api/village-properties")]
    public class VillagePropertyController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UploadStorage _uploads;

        public VillagePropertyController(AppDbContext context, UploadStorage uploads)
        {
            _context = context;
            _uploads = uploads;
        }

        [HttpGet("{village}")]
        public async Task<IActionResult> GetByVillage(string village)
        {
            var decodedVillage = village;
            if (!User.CanManageVillage(village)) return Forbid();

            var data = await _context.VillageProperties
                .Where(v => v.Village == decodedVillage)
                .OrderBy(v => v.UnitNumber)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = AccessRules.AdminRoles)]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var data = await _context.VillageProperties
                .OrderBy(v => v.Village)
                .ThenBy(v => v.UnitNumber)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("marketing")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMarketingProperties()
        {
            // Explicit allow-list: never expose resident details, private documents or notes.
            return Ok(await _context.VillageProperties.AsNoTracking()
                .Where(property => property.IsVisibleOnMarketing).OrderBy(property => property.Village)
                .ThenBy(property => property.UnitNumber).Select(property => new {
                    property.Id, property.Village, property.UnitNumber, property.Address,
                    property.MarketingTitle, property.MarketingDescription,
                    property.MarketingImageUrl1, property.MarketingImageUrl2, property.MarketingImageUrl3,
                    property.MarketingImageUrl4, property.MarketingImageUrl5
                }).ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] VillagePropertyWriteDto request)
        {
            if (!User.CanManageVillage(request.Village)) return Forbid();

            var property = new VillageProperty
            {
                Village = request.Village,
                UnitNumber = request.UnitNumber,
                Address = request.Address,
                ResidentCount = request.ResidentCount,
                ResidentName = request.ResidentName,
                ResidentEmail = request.ResidentEmail ?? "",
                ResidentOccupation = request.ResidentOccupation,
                VillageManagerName = request.VillageManagerName,
                Notes = request.Notes,

                IsVisibleOnMarketing = request.IsVisibleOnMarketing,
                MarketingTitle = request.MarketingTitle,
                MarketingDescription = request.MarketingDescription,

                CreatedAt = DateTime.UtcNow
            };

            property.DocumentUrl1 = await _uploads.Save(request.Document1, "village-properties");
            property.DocumentUrl2 = await _uploads.Save(request.Document2, "village-properties");

            property.MarketingImageUrl1 = await _uploads.Save(request.MarketingImage1, "marketing", imagesOnly: true);
            property.MarketingImageUrl2 = await _uploads.Save(request.MarketingImage2, "marketing", imagesOnly: true);
            property.MarketingImageUrl3 = await _uploads.Save(request.MarketingImage3, "marketing", imagesOnly: true);
            property.MarketingImageUrl4 = await _uploads.Save(request.MarketingImage4, "marketing", imagesOnly: true);
            property.MarketingImageUrl5 = await _uploads.Save(request.MarketingImage5, "marketing", imagesOnly: true);

            _context.VillageProperties.Add(property);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Village property saved successfully." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] VillagePropertyWriteDto request)
        {
            var property = await _context.VillageProperties.FindAsync(id);

            if (property == null)
            {
                return NotFound(new { message = "Property not found." });
            }
            if (!User.CanManageVillage(property.Village)) return Forbid();

            if (request.Village != property.Village) return BadRequest(new { message = "A property cannot be moved to another village." });

            property.UnitNumber = request.UnitNumber;
            property.Address = request.Address;
            property.ResidentCount = request.ResidentCount;
            property.ResidentName = request.ResidentName;
            property.ResidentEmail = request.ResidentEmail ?? "";
            property.ResidentOccupation = request.ResidentOccupation;
            property.VillageManagerName = request.VillageManagerName;
            property.Notes = request.Notes;

            property.IsVisibleOnMarketing = request.IsVisibleOnMarketing;
            property.MarketingTitle = request.MarketingTitle;
            property.MarketingDescription = request.MarketingDescription;

            property.UpdatedAt = DateTime.UtcNow;

            var document1 = await _uploads.Save(request.Document1, "village-properties");
            var document2 = await _uploads.Save(request.Document2, "village-properties");

            var marketingImage1 = await _uploads.Save(request.MarketingImage1, "marketing", imagesOnly: true);
            var marketingImage2 = await _uploads.Save(request.MarketingImage2, "marketing", imagesOnly: true);
            var marketingImage3 = await _uploads.Save(request.MarketingImage3, "marketing", imagesOnly: true);
            var marketingImage4 = await _uploads.Save(request.MarketingImage4, "marketing", imagesOnly: true);
            var marketingImage5 = await _uploads.Save(request.MarketingImage5, "marketing", imagesOnly: true);

            if (!string.IsNullOrWhiteSpace(document1)) property.DocumentUrl1 = document1;
            if (!string.IsNullOrWhiteSpace(document2)) property.DocumentUrl2 = document2;

            if (!string.IsNullOrWhiteSpace(marketingImage1)) property.MarketingImageUrl1 = marketingImage1;
            if (!string.IsNullOrWhiteSpace(marketingImage2)) property.MarketingImageUrl2 = marketingImage2;
            if (!string.IsNullOrWhiteSpace(marketingImage3)) property.MarketingImageUrl3 = marketingImage3;
            if (!string.IsNullOrWhiteSpace(marketingImage4)) property.MarketingImageUrl4 = marketingImage4;
            if (!string.IsNullOrWhiteSpace(marketingImage5)) property.MarketingImageUrl5 = marketingImage5;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Village property updated successfully." });
        }

        [HttpPut("{id}/marketing-visibility")]
        public async Task<IActionResult> UpdateMarketingVisibility(
            int id,
            [FromBody] MarketingVisibilityDto request
        )
        {
            var property = await _context.VillageProperties.FindAsync(id);

            if (property == null)
            {
                return NotFound(new { message = "Property not found." });
            }
            if (!User.CanManageVillage(property.Village)) return Forbid();

            property.IsVisibleOnMarketing = request.IsVisibleOnMarketing;
            property.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Marketing visibility updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var property = await _context.VillageProperties.FindAsync(id);

            if (property == null)
            {
                return NotFound(new { message = "Property not found." });
            }
            if (!User.CanManageVillage(property.Village)) return Forbid();

            _context.VillageProperties.Remove(property);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Village property deleted successfully." });
        }

    }
}
