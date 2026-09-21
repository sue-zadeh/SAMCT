using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;
using server.Security;
namespace server.Controllers;

[ApiController, Route("api/purchase-orders"), Authorize(Roles = AccessRules.StaffRoles)]
public class PurchaseOrderController(AppDbContext database) : ControllerBase
{
    [HttpGet("village/{village}")]
    public async Task<IActionResult> GetByVillage(string village) {
        if (!User.CanManageVillage(village)) return Forbid();
        return Ok(await database.PurchaseOrders.AsNoTracking().Where(item => item.Village == village).OrderByDescending(item => item.CreatedAt).ToListAsync());
    }
    [HttpGet("admin/all"), Authorize(Roles = AccessRules.AdminRoles)]
    public async Task<IActionResult> GetAll() => Ok(await database.PurchaseOrders.AsNoTracking().OrderByDescending(item => item.CreatedAt).ToListAsync());
    [HttpPost]
    public async Task<IActionResult> Create(PurchaseOrderRequestDto request) {
        if (!User.CanManageVillage(request.Village)) return Forbid();
        var order = new PurchaseOrder { CreatedByUserName = User.Identity!.Name!, CreatedAt = DateTime.UtcNow };
        Apply(order, request);
        database.PurchaseOrders.Add(order);
        await database.SaveChangesAsync();
        return Ok(new { id = order.Id, message = "Purchase order saved successfully." });
    }
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, PurchaseOrderRequestDto request) {
        var order = await database.PurchaseOrders.FindAsync(id);
        if (order is null) return NotFound();
        if (!User.CanManageVillage(order.Village) || !User.CanManageVillage(request.Village)) return Forbid();
        Apply(order, request); order.UpdatedAt = DateTime.UtcNow;
        await database.SaveChangesAsync();
        return Ok(new { message = "Purchase order updated successfully." });
    }
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) {
        var order = await database.PurchaseOrders.FindAsync(id);
        if (order is null) return NotFound();
        if (!User.CanManageVillage(order.Village)) return Forbid();
        database.PurchaseOrders.Remove(order);
        await database.SaveChangesAsync();
        return Ok(new { message = "Purchase order deleted successfully." });
    }
    private static void Apply(PurchaseOrder order, PurchaseOrderRequestDto request) {
        order.Village = request.Village; order.UnitNumber = request.UnitNumber.Trim(); order.Title = request.Title.Trim();
        order.Category = request.Category.Trim(); order.Supplier = request.Supplier.Trim(); order.EstimatedCost = request.EstimatedCost;
        order.Priority = request.Priority; order.Status = request.Status; order.Notes = request.Notes.Trim();
    }
}
