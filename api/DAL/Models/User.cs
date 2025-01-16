using System.ComponentModel.DataAnnotations;

namespace api.DAL.Models
{
    public class User
    {
        [Key]
        public required string Email { get; set; }  // Primary Key

        public required string Name { get; set; }
        
        public required string Password { get; set; }  // User's password (hashed, I hope)
        

        public string? Image { get; set; }  // Image URL for the user's profile picture
        public bool IsDriver { get; set; } = false;  // Indicates if the user can act as a driver, default is false
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  // Creation timestamp with default

        // Navigation property for requests where the user is the sender
        public ICollection<Request>? SentRequests { get; set; }

        // Navigation property for requests where the user is the driver
        public ICollection<Request>? DriverRequests { get; set; }
    }
}
