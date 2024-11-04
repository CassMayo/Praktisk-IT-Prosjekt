using api.DAL.Interfaces;
using api.DAL.Models;
using api.DAL.Enum;
using Microsoft.EntityFrameworkCore;
using api.DAL.DTOs.Request;

namespace api.DAL.Repositories
{ 
    public class RequestRepository : IRequestRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<RequestRepository> _logger;

        public RequestRepository(AppDbContext context, ILogger<RequestRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Request>> GetRequestsBySenderAsync(string senderEmail)
        {
            return await _context.Requests
                .Include(r => r.Driver)
                .Where(r => r.SenderEmail == senderEmail)
                .ToListAsync();
        }

        public async Task<IEnumerable<Request>> GetRequestsByDriverAsync(string driverEmail)
        {
            return await _context.Requests
                .Include(r => r.Sender)
                .Where(r => r.DriverEmail == driverEmail)
                .ToListAsync();
        }

        // Get request by query
        /*
        use the query object to filter the requests
        show max 10 requests per page
        */
        public async Task<IEnumerable<Request>> GetRequestsByQueryAsync(RequestQuery query)
        {
            var requests = _context.Requests.AsQueryable();

            // Filter by SenderEmail
            if (!string.IsNullOrEmpty(query.SenderEmail))
            {
                requests = requests.Where(r => r.SenderEmail == query.SenderEmail);
            }

            // Filter by PickupLocation
            if (!string.IsNullOrEmpty(query.PickupLocation))
            {
                requests = requests.Where(r => r.PickupLocation.Contains(query.PickupLocation));
            }

            // Filter by DropoffLocation
            if (!string.IsNullOrEmpty(query.DropoffLocation))
            {
                requests = requests.Where(r => r.DropoffLocation.Contains(query.DropoffLocation));
            }

            // Filter by ScheduledAt date
            if (query.ScheduledAt.HasValue)
            {
                requests = requests.Where(r => r.ScheduledAt.Value.Date == query.ScheduledAt.Value.Date);
            }

            // Filter by CreatedAt date
            if (query.CreatedAt.HasValue)
            {
                requests = requests.Where(r => r.CreatedAt.Date == query.CreatedAt.Value.Date);
            }

            // Filter by Description
            if (!string.IsNullOrEmpty(query.Description))
            {
                requests = requests.Where(r => r.Description.Contains(query.Description));
            }

            // Implement pagination
            int pageSize = 10;
            int pageNumber = query.Page > 0 ? query.Page : 1;

            return await requests
                .Include(r => r.Sender)
                .Include(r => r.Driver)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<Request?> GetRequestByIdAsync(int requestId)
        {
            return await _context.Requests
                .Include(r => r.Sender)
                .Include(r => r.Driver)
                .FirstOrDefaultAsync(r => r.RequestId == requestId);
        }

        public async Task<Request> CreateRequestAsync(Request request)
        {
            _context.Requests.Add(request);
            await _context.SaveChangesAsync();
            return request;
        }

        public async Task<Request> UpdateRequestStatusAsync(int requestId, RequestStatus newStatus)
        {
            var request = await _context.Requests.FindAsync(requestId);
            if (request == null)
                throw new KeyNotFoundException($"Request with ID {requestId} not found.");

            request.Status = newStatus;
            await _context.SaveChangesAsync();
            return request;
        }

        public async Task<Request> AssignDriverToRequestAsync(int requestId, string driverEmail)
        {
            var request = await _context.Requests.FindAsync(requestId);
            if (request == null)
                throw new KeyNotFoundException($"Request with ID {requestId} not found.");

            request.DriverEmail = driverEmail;
            request.Status = RequestStatus.Accepted;
            await _context.SaveChangesAsync();
            return request;
        }

        public async Task<bool> DeleteRequestAsync(int requestId)
        {
            var request = await _context.Requests
                .FirstOrDefaultAsync(r => r.RequestId == requestId);

            if (request == null)
                return false;

            _context.Requests.Remove(request);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}