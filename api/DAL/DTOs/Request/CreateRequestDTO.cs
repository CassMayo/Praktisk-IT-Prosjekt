using System;
using api.DAL.Enum;

namespace api.DAL.DTOs.Request
{
    public class CreateRequestDTO
    {
        public required string SenderEmail { get; set; }
        public required string PickupLocation { get; set; }
        public required string DropoffLocation { get; set; }
        public string? Description { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public DateTime? AlternateDate { get; set; }
        
    }
}