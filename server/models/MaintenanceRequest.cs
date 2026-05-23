using System;

namespace server.Models
{
    public class MaintenanceRequest
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        
        // Status tracking: "Pending", "In Progress", "Completed"
        public string Status { get; set; } = "Pending"; 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Hard security scope: ensures Village Managers only pull records for their area
        public string Village { get; set; } = ""; 

        // The Resident foreign key link
        public int UserId { get; set; }
        public User? User { get; set; }

        // The Village Manager's response tracking
        public string? ManagerAnswer { get; set; }
        public int? HandledById { get; set; } // Tracks which VM resolved it
        public User? HandledBy { get; set; }
    }
}