namespace server.Models
{
    public class PurchaseOrder
    {
        public int Id { get; set; }
        public string Village { get; set; } = "";
        public string UnitNumber { get; set; } = "";
        public string Title { get; set; } = "";
        public string Category { get; set; } = "";
        public string Supplier { get; set; } = "";
        public decimal EstimatedCost { get; set; }
        public string Priority { get; set; } = "Normal";
        public string Status { get; set; } = "Pending";
        public string Notes { get; set; } = "";
        public string CreatedByUserName { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
