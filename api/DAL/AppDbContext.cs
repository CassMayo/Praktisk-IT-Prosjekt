using Microsoft.EntityFrameworkCore;
using api.DAL.Models;

namespace api.DAL.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { 
            //Database.Delete();  // Delete the database'
            //Database.EnsureCreated();  // Create the database if it doesn't exist
           
        }

        // DbSets for each model
        public DbSet<User> Users { get; set; }  // Users table
        public DbSet<Request> Requests { get; set; }  // Requests table
        public DbSet<Item> Items { get; set; }  // Items table

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Optional: Configure any specific model relationships or constraints here

            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasKey(u => u.Email);

            // cascade delete requests when user is deleted
            modelBuilder.Entity<User>()
                .HasMany(u => u.Requests)
                .WithOne(r => r.Sender)
                .OnDelete(DeleteBehavior.Cascade);


            // cascade delete items when request is deleted 
            modelBuilder.Entity<Request>()
                .HasKey(r => r.RequestId);

            modelBuilder.Entity<Request>()
                .HasMany(r => r.Items)
                .WithOne(i => i.Request)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
