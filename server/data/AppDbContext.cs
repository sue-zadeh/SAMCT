using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
  // Represents our connection/session with the database.
    public class AppDbContext : DbContext
    {
     // ASP.NET passes database configuration into this constructor.
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }
        public DbSet<MaintenanceRequest> MaintenanceRequests { get; set; }
        public DbSet<DocumentNotice> DocumentNotices { get; set; }
        public DbSet<VillageProperty> VillageProperties { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
    }
}