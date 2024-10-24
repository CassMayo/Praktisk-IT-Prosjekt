using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;
using api.DAL.Models;

namespace api.DAL
{
    public static class DBInit
    {
        public static void Seed(IApplicationBuilder app)
        {
            using var serviceScope = app.ApplicationServices.CreateScope();
            var context = serviceScope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Ensure the database is created 
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();

            // Seed the data if the Users table is empty
            if (!context.Users.Any())
            {
                var users = new List<User>
                {
                    new User
                    {
                        Email = "driver1@example.com",
                        Name = "John Doe",
                        Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                        Pfp = "https://example.com/images/johndoe.jpg",
                        IsDriver = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Email = "driver2@example.com",
                        Name = "Jane Smith",
                        Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                        Pfp = "https://example.com/images/janesmith.jpg",
                        IsDriver = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                // Add users to the context
                context.Users.AddRange(users);

                // Save the changes to the database
                context.SaveChanges();
            }
        }
    }
}