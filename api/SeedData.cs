using Microsoft.EntityFrameworkCore;
using api.DAL.Models;
using api.DAL.Enum;
using System;
using System.Linq;
using Microsoft.AspNetCore.Identity;

namespace api
{
    public static class SeedData
    {
        private static readonly Random random = new Random();
        
        // Predefined lists for pickup and dropoff locations and descriptions
        private static readonly string[] pickupLocations = {
            "Central Park",
            "Downtown Station",
            "City Library",
            "Westside Mall",
            "Eastside Hospital",
            "Riverside Cafe",
            "Mountain View Park",
            "Sunset Boulevard",
            "Harbor Front",
            "Greenwood Avenue"
        };
        
        private static readonly string[] dropoffLocations = {
            "Airport Terminal",
            "University Campus",
            "Industrial Park",
            "Seaside Pier",
            "Mountain Retreat",
            "Downtown Office",
            "City Museum",
            "Lakeside Drive",
            "Old Town Square",
            "Riverwalk Plaza"
        };
        
        private static readonly string[] descriptionTemplates = {
            "Need a ride to {0}.",
            "Transport required for {0}.",
            "Looking to go to {0} today.",
            "Requesting pickup from {0}.",
            "Need assistance getting to {0}.",
            "Traveling to {0} this afternoon.",
            "Moving to {0}, please assist.",
            "Heading to {0}, need a driver.",
            "Going to {0}, require transportation.",
            "Destination {0}, need a ride."
        };
        
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var context = new AppDbContext(
                serviceProvider.GetRequiredService<DbContextOptions<AppDbContext>>());

            // Clear existing data
            var changeData = false;

            if (changeData)
            {                
                context.Requests.RemoveRange(context.Requests);
                context.Users.RemoveRange(context.Users);
                context.Items.RemoveRange(context.Items);
                context.SaveChanges();
            }

            // Seed Users
            var users = new User[15];
            var hasher = new PasswordHasher<User>();
            var commonPassword = "12345678";

            for (int i = 0; i < 15; i++) // Create users with random names and emails
            {
                var name = GenerateRandomName();
                var user = new User
                {
                    Email = GenerateRandomEmail(name),
                    Name = name,
                    IsDriver = i >= 10, // The last 2 users will be drivers
                    Password = BCrypt.Net.BCrypt.HashPassword(commonPassword)
                };
                users[i] = user;
            }

            context.Users.AddRange(users);
            context.SaveChanges();

            // Seed Requests
            var allUsers = context.Users.ToList();
            var drivers = allUsers.Where(u => u.IsDriver).ToList();
            int totalRequests = 100;
            int driverRequests = (int)(totalRequests * 0.2); // 20% of requests will have a driver assigned

            // Select unique random indices for driver assignments
            var driverRequestIndices = new HashSet<int>();
            while (driverRequestIndices.Count < driverRequests)
            {
                driverRequestIndices.Add(random.Next(totalRequests));
            }

            for (int i = 0; i < totalRequests; i++)
            {
                var sender = users[random.Next(users.Length)];
                var pickup = pickupLocations[random.Next(pickupLocations.Length)];
                var dropoff = dropoffLocations[random.Next(dropoffLocations.Length)];
                var descriptionTemplate = descriptionTemplates[random.Next(descriptionTemplates.Length)];
                var description = string.Format(descriptionTemplate, dropoff);

                var request = new Request
                {
                    Sender = sender,
                    SenderEmail = sender.Email,
                    PickupLocation = pickup,
                    DropoffLocation = dropoff,
                    Description = description,
                    ScheduledAt = DateTime.Now
                        .AddDays(random.Next(1, 30))
                        .AddHours(random.Next(0, 24))
                        .AddMinutes(random.Next(0, 60)),
                    Status = RequestStatus.Pending,
                    CreatedAt = DateTime.Now
                };

                if (driverRequestIndices.Contains(i) && drivers.Any())
                {
                    var driver = drivers[random.Next(drivers.Count)];
                    request.Driver = driver; // Ensure the Request class has a Driver property
                    // RequestStatus is randomly assigned to either Accepted, Completed, Lost or Cancelled
                    request.Status = (RequestStatus)random.Next(1, 5);
                }

                context.Requests.Add(request);
            }

            context.SaveChanges();

            // Seed Items
            var requests = context.Requests.ToList();
            // 2 - 5 items per request
            foreach (var request in requests)
            {
                int itemCount = random.Next(2, 6);
                for (int i = 0; i < itemCount; i++)
                {
                    var item = new Item
                    {
                        Request = request,
                        RequestId = request.RequestId,
                        ItemName = $"Item {i + 1}",
                        ItemType = (ItemType)random.Next(0, 5),
                        Description = "Random item description",
                        Price = (float)random.NextDouble() * 100
                    };
                    context.Items.Add(item);
                }
            }

            context.SaveChanges();
        }

        private static string GenerateRandomEmail(string name)
        {
            string[] domains = { "example.com", "mail.com", "test.com", "demo.com" };
            string domain = domains[random.Next(domains.Length)];

            var parts = name.Split(' ');
            string firstName = parts[0].ToLower();
            string lastName = parts[1].ToLower();

            // Create variations similar to the examples
            string emailPrefix;
            if (random.NextDouble() < 0.5)
            {
                emailPrefix = $"{firstName}{lastName}{random.Next(1, 100)}";
            }
            else
            {
                emailPrefix = $"{lastName[0]}{firstName[0]}{random.Next(1, 100)}{lastName.Substring(1)}{random.Next(10, 1000)}";
            }

            return $"{emailPrefix}@{domain}";
        }

        private static string GenerateRandomName()
        {
            string[] firstNames = { "Alex", "Jamie", "Taylor", "Jordan", "Morgan", "Casey", "Blake" };
            string[] lastNames = { "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis" };
            string firstName = firstNames[random.Next(firstNames.Length)];
            string lastName = lastNames[random.Next(lastNames.Length)];
            return $"{firstName} {lastName}";
        }
    }
}
