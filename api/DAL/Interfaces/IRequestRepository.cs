using api.DAL.Models;
using api.DAL.Enum;

namespace api.DAL.Interfaces
{
    public interface IRequestRepository
    {
        Task<IEnumerable<Request>> GetAllRequestsAsync(); 
        Task<IEnumerable<Request>> GetRequestsBySenderAsync(string senderEmail);
        Task<IEnumerable<Request>> GetRequestsByDriverAsync(string driverEmail);
        Task<IEnumerable<Request>> GetPendingRequestsAsync();
        Task<Request?> GetRequestByIdAsync(int requestId);
        Task<Request> CreateRequestAsync(Request request);
        Task<Request> UpdateRequestStatusAsync(int requestId, RequestStatus newStatus);
        Task<Request> AssignDriverToRequestAsync(int requestId, string driverEmail);
        Task<bool> DeleteRequestAsync(int requestId);
    }
}