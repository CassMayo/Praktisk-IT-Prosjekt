using Microsoft.EntityFrameworkCore;

namespace api.Models
{
    public class SenderDbContext : DbContext
    {
        public SenderDbContext(DbContextOptions<SenderDbContext> options) : base(options)
        {
        }

        public DbSet<Sender> Senders { get; set; }
    }
}