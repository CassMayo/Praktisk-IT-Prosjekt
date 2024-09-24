using Microsoft.EntityFrameworkCore;

namespace api.Models
{
    public class SenderDbContext : DbContext
    {
        public SenderDbContext(DbContextOptions<SenderDbContext> options) : base(options)
        {
            Database.EnsureDeleted();
            Database.EnsureCreated();
        }

        public DbSet<Sender> Senders { get; set; }
    }
}