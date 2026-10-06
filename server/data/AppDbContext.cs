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
        public DbSet<MarketingContent> MarketingContents { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<AuthSession> AuthSessions { get; set; }
        public DbSet<MfaChallenge> MfaChallenges { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<MarketingContent>().HasIndex(content => content.Slug).IsUnique();
            modelBuilder.Entity<MarketingContent>().Property(content => content.PriceNzd).HasPrecision(12, 2);
            modelBuilder.Entity<MarketingContent>().ToTable(table => table.HasCheckConstraint("CK_MarketingContents_Images", "cardinality(\"Images\") <= 10"));
            modelBuilder.Entity<AuthSession>().Property(session => session.Id).HasMaxLength(64);
            modelBuilder.Entity<AuthSession>().HasIndex(session => session.ExpiresAt);
            modelBuilder.Entity<MfaChallenge>().Property(challenge => challenge.Id).HasMaxLength(64);
            modelBuilder.Entity<MfaChallenge>().Property(challenge => challenge.PasswordStamp).HasMaxLength(64);
            modelBuilder.Entity<MfaChallenge>().HasIndex(challenge => challenge.ExpiresAt);
        }
    }
}
