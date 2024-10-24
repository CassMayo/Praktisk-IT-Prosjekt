using api.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace api.DAL.Interfaces
{
    public interface IRequestRepository
    {
        Task<IEnumerable<Request>> GetAllRequestsAsync();
        Task<Request?> GetRequestByIdAsync(int requestId);
        Task<IEnumerable<Request>> GetRequestsBySenderEmailAsync(string senderEmail);
        Task<IEnumerable<Request>> GetRequestsByDriverEmailAsync(string driverEmail);
        Task<bool> AddRequestAsync(Request request);
        Task<bool> UpdateRequestAsync(Request request);
        Task<bool> DeleteRequestAsync(int requestId);
    }
}
