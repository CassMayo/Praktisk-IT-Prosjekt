using api.DAL.Models;
using api.DAL.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace api.DAL.Repositories
{
    public class RequestRepository : IRequestRepository
    {
        private readonly AppDbContext _context;

        public RequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Request>> GetAllRequestsAsync()
        {
            return await _context.Requests
                .Include(r => r.Sender)
                .Include(r => r.Driver)
                .ToListAsync();
        }

        public async Task<Request?> GetRequestByIdAsync(int requestId)
        {
            return await _context.Requests
                .Include(r => r.Sender)
                .Include(r => r.Driver)
                .FirstOrDefaultAsync(r => r.RequestId == requestId);
        }

        public async Task<IEnumerable<Request>> GetRequestsBySenderEmailAsync(string senderEmail)
        {
            return await _context.Requests
                .Where(r => r.SenderEmail == senderEmail)
                .Include(r => r.Sender)
                .Include(r => r.Driver)
                .ToListAsync();
        }

        public async Task<IEnumerable<Request>> GetRequestsByDriverEmailAsync(string driverEmail)
        {
            return await _context.Requests
                .Where(r => r.DriverEmail == driverEmail)
                .Include(r => r.Sender)
                .Include(r => r.Driver)
                .ToListAsync();
        }

        public async Task<bool> AddRequestAsync(Request request)
        {
            _context.Requests.Add(request);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateRequestAsync(Request request)
        {
            _context.Requests.Update(request);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteRequestAsync(int requestId)
        {
            var request = await _context.Requests.FindAsync(requestId);
            if (request == null)
            {
                return false;
            }

            _context.Requests.Remove(request);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
