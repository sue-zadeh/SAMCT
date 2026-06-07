namespace server.Models
{
    public class VillageProperty
    {
        public int Id { get; set; }
        public string Village { get; set; } = "";
        public string UnitNumber { get; set; } = "";
        public string Address { get; set; } = "";
        public int ResidentCount { get; set; } = 1;

        public string ResidentName { get; set; } = "";
        public string ResidentEmail { get; set; } = "";
        public string ResidentOccupation { get; set; } = "";

        public string VillageManagerName { get; set; } = "";
        public string Notes { get; set; } = "";

        public string DocumentUrl1 { get; set; } = "";
        public string DocumentUrl2 { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}