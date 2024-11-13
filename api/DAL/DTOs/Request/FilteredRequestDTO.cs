namespace api.DAL.DTOs.Request
{
    public class FilteredRequestDTO
    {
        public int RequestId { get; set; }
        public string SenderEmail { get; set; }
        public string PickupLocation { get; set; }
        public string DropoffLocation { get; set; }
        public string Description { get; set; } // Added Description
        public DateTime ScheduledAt { get; set; }
        public DateTime AlternateDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
