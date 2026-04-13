using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }
        public DbSet<MaintenanceRequest> MaintenanceRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    FirstName = "Sue",
                    LastName = "Admin",
                    FullName = "Sue Admin",
                    Email = "admin@samct.co.nz",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    Role = "Admin",
                    ProfileImageUrl = "https://via.placeholder.com/80",
                    IsActive = true
                },
                new User
                {
                    Id = 2,
                    FirstName = "John",
                    LastName = "Resident",
                    FullName = "John Resident",
                    Email = "resident@samct.co.nz",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Resident123!"),
                    Role = "Resident",
                    ProfileImageUrl = "https://via.placeholder.com/80",
                    IsActive = true
                }
            );
        }
    }
}