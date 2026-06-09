using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/purchase-orders")]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PurchaseOrderController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("village/{village}")]
        public async Task<IActionResult> GetByVillage(string village)
        {
            var decodedVillage = Uri.UnescapeDataString(village);

            var orders = await _context.PurchaseOrders
                .Where(o => o.Village == decodedVillage)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _context.PurchaseOrders
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> Create(PurchaseOrder order)
        {
            order.Status = "Pending";
            order.CreatedAt = DateTime.UtcNow;

            _context.PurchaseOrders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Purchase order saved successfully." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, PurchaseOrder request)
        {
            var order = await _context.PurchaseOrders.FindAsync(id);

            if (order == null)
            {
                return NotFound(new { message = "Purchase order not found." });
            }

            order.UnitNumber = request.UnitNumber;
            order.Title = request.Title;
            order.Category = request.Category;
            order.Supplier = request.Supplier;
            order.EstimatedCost = request.EstimatedCost;
            order.Priority = request.Priority;
            order.Status = request.Status;
            order.Notes = request.Notes;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Purchase order updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var order = await _context.PurchaseOrders.FindAsync(id);

            if (order == null)
            {
                return NotFound(new { message = "Purchase order not found." });
            }

            _context.PurchaseOrders.Remove(order);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Purchase order deleted successfully." });
        }
    }
}