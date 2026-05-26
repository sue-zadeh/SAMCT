using System;

namespace server.Models
{
    public class MaintenanceRequest
    {
        public int Id { get; set; }

        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string UnitOrAddress { get; set; } = "";
        public string Priority { get; set; } = "Normal";
        public string Status { get; set; } = "Pending";

        public string Village { get; set; } = "";

        public int UserId { get; set; }
        public User? User { get; set; }

        public string? ManagerAnswer { get; set; }

        public int? HandledById { get; set; }
        public User? HandledBy { get; set; }

        public bool IsReadByResident { get; set; } = true;
        public bool IsReadByManager { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}