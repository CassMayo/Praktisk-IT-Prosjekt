namespace api.DAL.DTOs.Request
{
    public class RequestQuery
    {
        public string? SenderEmail { get; set; }
        public string? PickupLocation { get; set; }
        public string? DropoffLocation { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? Description { get; set; }
        public int Page { get; set; } = 1;
    }
}