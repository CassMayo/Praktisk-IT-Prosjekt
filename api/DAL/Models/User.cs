using System.ComponentModel.DataAnnotations;

namespace api.DAL.Models
{
    public class User
    {
        [Key]
        public required string Email { get; set; }  // Primary Key

        public required string Name { get; set; }
        
        public required string Password { get; set; }  // User's password (hashed, I hope)
        
        [Required]
        public string Pfp { get; set; } = "default_profile_picture_url";  // Profile picture URL with default
        
        [Required]
        public bool IsDriver { get; set; } = false;  // Indicates if the user can act as a driver, default is false
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  // Creation timestamp with default

        public virtual List<Request>? Requests { get; set; }  // Navigation property for Requests
    }
}
