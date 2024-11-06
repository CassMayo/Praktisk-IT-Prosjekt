namespace api.DAL.DTOs.Request
{
    public class UpdateRequestDTO
    {
        public string? PickupLocation { get; set; }
        public string? DropoffLocation { get; set; }
        public string? Description { get; set; }
        public DateTime? ScheduledAt { get; set; }
    }
}