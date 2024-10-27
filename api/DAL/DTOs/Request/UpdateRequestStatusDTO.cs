using api.DAL.Enum;

namespace api.DAL.DTOs.Request
{
    public class UpdateRequestStatusDTO
    {
        public required RequestStatus Status { get; set; }
    }
}