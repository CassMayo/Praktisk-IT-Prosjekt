using Microsoft.EntityFrameworkCore;

namespace api.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            Database.EnsureCreated();
        }

        public DbSet<Sender> Senders { get; set; }
    }
}