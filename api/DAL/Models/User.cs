using System.ComponentModel.DataAnnotations;

namespace api.DAL.Models
{
    public class User
    {
        [Key]
        public required string Email { get; set; }  // Primary Key
        
        public required string Password { get; set; }  // User's password (hashed, I hope)
        
        public required string Pfp { get; set; } = "default_profile_picture_url";  // Profile picture URL with default
        
        public required bool IsDriver { get; set; } = false;  // Indicates if the user can act as a driver, default is false
        
        public required DateTime CreatedAt { get; set; } = DateTime.UtcNow;  // Creation timestamp with default
    }
}
