[HttpGet("summary/admin")]
public async Task<IActionResult> GetAdminSummary()
{
    var summary = await _context.MaintenanceRequests
        .GroupBy(r => r.Village)
        .Select(g => new
        {
            Village = g.Key,
            Total = g.Count(),
            Pending = g.Count(r => r.Status == "Pending"),
            InProgress = g.Count(r => r.Status == "In Progress"),
            Completed = g.Count(r => r.Status == "Completed")
        })
        .ToListAsync();

    return Ok(summary);
}

[HttpGet("summary/village/{village}")]
public async Task<IActionResult> GetVillageSummary(string village)
{
    var decodedVillage = Uri.UnescapeDataString(village).Trim();

    var requests = await _context.MaintenanceRequests
        .Where(r => r.Village == decodedVillage)
        .ToListAsync();

    return Ok(new
    {
        Village = decodedVillage,
        Total = requests.Count,
        Pending = requests.Count(r => r.Status == "Pending"),
        InProgress = requests.Count(r => r.Status == "In Progress"),
        Completed = requests.Count(r => r.Status == "Completed")
    });
}

[HttpGet("summary/resident/{username}")]
public async Task<IActionResult> GetResidentSummary(string username)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.UserName == username.Trim());

    if (user == null)
        return NotFound(new { message = "Resident not found." });

    var requests = await _context.MaintenanceRequests
        .Where(r => r.UserId == user.Id)
        .ToListAsync();

    return Ok(new
    {
        Total = requests.Count,
        Pending = requests.Count(r => r.Status == "Pending"),
        InProgress = requests.Count(r => r.Status == "In Progress"),
        Completed = requests.Count(r => r.Status == "Completed"),
        NewResponses = requests.Count(r => r.IsReadByResident == false)
    });
}