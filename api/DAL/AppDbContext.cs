using Microsoft.EntityFrameworkCore;
using api.DAL.Models;

namespace api.DAL.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSets for each model
        public DbSet<User> Users { get; set; }  // Users table
        public DbSet<Request> Requests { get; set; }  // Requests table
        public DbSet<Item> Items { get; set; }  // Items table

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Optional: Configure any specific model relationships or constraints here

            base.OnModelCreating(modelBuilder);
        }
    }
}
