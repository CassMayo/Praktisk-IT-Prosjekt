using api.DAL.Interfaces;
using api.DAL.Models;
using api.DAL.Enum;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
    public class RequestRepository : IRequestRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<RequestRepository> _logger;

        public RequestRepository(AppDbContext context, ILogger<RequestRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Request>> GetAllRequestsAsync()
        {
            return await _context.Requests
                .Include(r => r.Sender)
                .Include(r => r.Driver)
                .ToListAsync();
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

        public async Task<IEnumerable<Request>> GetPendingRequestsAsync()
        {
            return await _context.Requests
                .Include(r => r.Sender)
                .Where(r => r.Status == RequestStatus.Pending)
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
