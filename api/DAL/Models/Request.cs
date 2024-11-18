using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using api.DAL.Enum;

namespace api.DAL.Models
{
    public class Request
    {
        [Key]
        public int RequestId { get; set; }

        [ForeignKey("Sender")]
        public required string SenderEmail { get; set; }

        [ForeignKey("Driver")]
        public string? DriverEmail { get; set; }

        public required string PickupLocation { get; set; }

        public required string DropoffLocation { get; set; }

        public string? Description { get; set; }

        public RequestStatus Status { get; set; } = RequestStatus.Draft;  // Changed default to Draft

        public DateTime? ScheduledAt { get; set; }  // Earliest date

        public DateTime? AlternateDate { get; set; }  // Latest date

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual required User Sender { get; set; }
        public virtual User? Driver { get; set; }

        public virtual List<Item>? Items { get; set; }
    }
}
