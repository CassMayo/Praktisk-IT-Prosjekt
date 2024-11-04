using api.DAL.Models;
using api.DAL.Enum;
using api.DAL.DTOs.Request;

namespace api.DAL.Interfaces
{
    public interface IRequestRepository
    {
        Task<IEnumerable<Request>> GetRequestsBySenderAsync(string senderEmail);
        Task<IEnumerable<Request>> GetRequestsByDriverAsync(string driverEmail);
        Task<IEnumerable<Request>> GetRequestsByQueryAsync(RequestQuery query);
        Task<Request?> GetRequestByIdAsync(int requestId);
        Task<Request> CreateRequestAsync(Request request);
        Task<Request> UpdateRequestStatusAsync(int requestId, RequestStatus newStatus);
        Task<Request> AssignDriverToRequestAsync(int requestId, string driverEmail);
        Task<bool> DeleteRequestAsync(int requestId);
    }
}