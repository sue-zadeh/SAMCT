using System;

namespace server.Models
{
    public class DocumentNotice
    {
        public int Id { get; set; }

        public string Title { get; set; } = "";
        public string Type { get; set; } = "Notice";
        public string Description { get; set; } = "";
        public string Village { get; set; } = "";

        public string FileUrl { get; set; } = "";
        public bool IsVisibleToResidents { get; set; } = true;

        public int CreatedByUserId { get; set; }
        public User? CreatedByUser { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}