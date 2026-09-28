using System.ComponentModel.DataAnnotations;
namespace server.DTOs;
public class PurchaseOrderRequestDto
{
    [Required, RegularExpression("Ngatea|Whitianga")] public string Village { get; set; } = "";
    [Required, StringLength(30)] public string UnitNumber { get; set; } = "";
    [Required, StringLength(160)] public string Title { get; set; } = "";
    [Required, StringLength(80)] public string Category { get; set; } = "";
    [Required, StringLength(160)] public string Supplier { get; set; } = "";
    [Range(typeof(decimal), "0", "10000000")] public decimal EstimatedCost { get; set; }
    [Required, RegularExpression("Low|Normal|High|Urgent")] public string Priority { get; set; } = "Normal";
    [Required, RegularExpression("Pending|In Progress|Completed|Cancelled")] public string Status { get; set; } = "Pending";
    [StringLength(2000)] public string Notes { get; set; } = "";
}
