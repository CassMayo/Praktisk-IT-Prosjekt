using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using api.DAL.Enum;

namespace api.DAL.Models
{
    public class Request
    {
        [Key]
        public int RequestId { get; set; }  // Primary Key

        [ForeignKey("Sender")]
        public required string SenderEmail { get; set; }  // Foreign Key to User (Sender)

        [ForeignKey("Driver")]
        public string? DriverEmail { get; set; }  // Foreign Key to User (nullable for when not assigned)

        public required string PickupLocation { get; set; }
        
        public required string DropoffLocation { get; set; }
        
        public string? Description { get; set; }
        
        public RequestStatus Status { get; set; } = RequestStatus.Pending;  // Default status pending
        
        public DateTime? ScheduledAt { get; set; }  // Optional: specifies when the pickup should be carried out
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  // Creation timestamp with default

        // Navigation properties
        public virtual required User Sender { get; set; }  // Navigation property to Sender
        public virtual User? Driver { get; set; }  // Navigation property to Driver (nullable)
    }
}
