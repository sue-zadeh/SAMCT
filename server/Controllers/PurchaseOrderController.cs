using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using server.Security;

namespace server.Controllers;

[ApiController]
[Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
[Route("api/purchase-orders")]
public class PurchaseOrderController(AppDbContext context) : ControllerBase
{
    private static readonly HashSet<string> AllowedPriorities =
        new(StringComparer.OrdinalIgnoreCase) { "Low", "Normal", "High", "Urgent" };

    private static readonly HashSet<string> AllowedStatuses =
        new(StringComparer.OrdinalIgnoreCase) { "Pending", "Approved", "Ordered", "Completed", "Cancelled" };

    [HttpGet("village/{village}")]
    public async Task<IActionResult> GetByVillage(string village)
    {
        var decodedVillage = Uri.UnescapeDataString(village).Trim();
        if (!User.CanAccessVillage(decodedVillage)) return Forbid();

        return Ok(await context.PurchaseOrders
            .AsNoTracking()
            .Where(order => order.Village == decodedVillage)
            .OrderByDescending(order => order.CreatedAt)
            .ToListAsync());
    }

    [HttpGet("admin/all")]
    [Authorize(Policy = SecurityPolicies.AdminOnly)]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await context.PurchaseOrders
            .AsNoTracking()
            .OrderByDescending(order => order.CreatedAt)
            .ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PurchaseOrder request)
    {
        request.Village = request.Village.Trim();
        if (!User.CanAccessVillage(request.Village)) return Forbid();

        var validationError = Validate(request);
        if (validationError is not null) return BadRequest(new { message = validationError });

        var order = new PurchaseOrder
        {
            Village = request.Village,
            UnitNumber = request.UnitNumber.Trim(),
            Title = request.Title.Trim(),
            Category = request.Category.Trim(),
            Supplier = request.Supplier.Trim(),
            EstimatedCost = request.EstimatedCost,
            Priority = Normalize(request.Priority, AllowedPriorities, "Normal"),
            Status = Normalize(request.Status, AllowedStatuses, "Pending"),
            Notes = request.Notes.Trim(),
            CreatedByUserName = User.GetUserName(),
            CreatedAt = DateTime.UtcNow
        };

        context.PurchaseOrders.Add(order);
        await context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetByVillage), new { village = order.Village }, new
        {
            order.Id,
            message = "Purchase order saved successfully."
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] PurchaseOrder request)
    {
        var order = await context.PurchaseOrders.FindAsync(id);
        if (order is null) return NotFound(new { message = "Purchase order not found." });
        if (!User.CanAccessVillage(order.Village)) return Forbid();

        // Village ownership is immutable here; moving records between villages
        // would bypass the tenant boundary and needs a separate audited workflow.
        request.Village = order.Village;
        var validationError = Validate(request);
        if (validationError is not null) return BadRequest(new { message = validationError });

        order.UnitNumber = request.UnitNumber.Trim();
        order.Title = request.Title.Trim();
        order.Category = request.Category.Trim();
        order.Supplier = request.Supplier.Trim();
        order.EstimatedCost = request.EstimatedCost;
        order.Priority = Normalize(request.Priority, AllowedPriorities, order.Priority);
        order.Status = Normalize(request.Status, AllowedStatuses, order.Status);
        order.Notes = request.Notes.Trim();
        order.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        return Ok(new { message = "Purchase order updated successfully." });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var order = await context.PurchaseOrders.FindAsync(id);
        if (order is null) return NotFound(new { message = "Purchase order not found." });
        if (!User.CanAccessVillage(order.Village)) return Forbid();

        context.PurchaseOrders.Remove(order);
        await context.SaveChangesAsync();
        return Ok(new { message = "Purchase order deleted successfully." });
    }

    private static string? Validate(PurchaseOrder order)
    {
        if (string.IsNullOrWhiteSpace(order.Village) || order.Village.Length > 100 ||
            string.IsNullOrWhiteSpace(order.Title) || order.Title.Length > 150 ||
            order.UnitNumber.Length > 50 || order.Category.Length > 100 ||
            order.Supplier.Length > 150 || order.Notes.Length > 4_000)
        {
            return "Purchase order details are invalid.";
        }

        if (order.EstimatedCost < 0 || order.EstimatedCost > 100_000_000)
        {
            return "Estimated cost is outside the accepted range.";
        }

        if (!string.IsNullOrWhiteSpace(order.Priority) && !AllowedPriorities.Contains(order.Priority) ||
            !string.IsNullOrWhiteSpace(order.Status) && !AllowedStatuses.Contains(order.Status))
        {
            return "Priority or status is invalid.";
        }

        return null;
    }

    private static string Normalize(string value, HashSet<string> allowed, string fallback) =>
        allowed.FirstOrDefault(item => item.Equals(value, StringComparison.OrdinalIgnoreCase)) ?? fallback;
}
