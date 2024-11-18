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
        private readonly string _uploadDirectory;

        public RequestRepository(AppDbContext context, ILogger<RequestRepository> logger)
        {
            _context = context;
            _logger = logger;
            _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Images");
        }

        private async Task DeleteImageAsync(string? imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return;

            try
            {
                var fileName = Path.GetFileName(imageUrl);
                var filePath = Path.Combine(_uploadDirectory, fileName);
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    _logger.LogInformation("Deleted image file: {FileName}", fileName);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image file: {ImageUrl}", imageUrl);
                throw;
            }
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
        public async Task<IEnumerable<FilteredRequestDTO>> GetRequestsByQueryAsync(RequestQuery query)
        {
            var requests = _context.Requests.AsQueryable();

            // Existing filters...
            if (!string.IsNullOrEmpty(query.SenderEmail))
            {
                requests = requests.Where(r => r.SenderEmail == query.SenderEmail);
            }
            if (!string.IsNullOrEmpty(query.PickupLocation))
            {
                requests = requests.Where(r => r.PickupLocation.Contains(query.PickupLocation));
            }
            if (!string.IsNullOrEmpty(query.DropoffLocation))
            {
                requests = requests.Where(r => r.DropoffLocation.Contains(query.DropoffLocation));
            }
            if (query.ScheduledAt.HasValue)
            {
                requests = requests.Where(r => r.ScheduledAt.Value.Date == query.ScheduledAt.Value.Date);
            }
            if (query.Status.HasValue)
            {
                requests = requests.Where(r => r.Status == query.Status.Value);
            }

            if (!string.IsNullOrEmpty(query.SearchTerm))
            {
                var searchTerm = query.SearchTerm.ToLower();
                requests = requests.Where(r => 
                    r.PickupLocation.ToLower().Contains(searchTerm) ||
                    r.DropoffLocation.ToLower().Contains(searchTerm) ||
                    r.Description.ToLower().Contains(searchTerm));
            }

            // Filter out requests that already have a driver
            requests = requests.Where(r => r.DriverEmail == null);

            // Implement pagination
            int pageSize = 10;
            int pageNumber = query.Page > 0 ? query.Page : 1;

            return await requests
                .Include(r => r.Sender)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new FilteredRequestDTO
                {
                    RequestId = r.RequestId,
                    SenderEmail = r.SenderEmail,
                    PickupLocation = r.PickupLocation,
                    DropoffLocation = r.DropoffLocation,
                    Description = r.Description, // Include Description
                    ScheduledAt = r.ScheduledAt ?? DateTime.MinValue,
                    CreatedAt = r.CreatedAt
                })
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

        public async Task<Request> UpdateRequestAsync(Request request)
        {
            _context.Requests.Update(request);
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
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Get all items with their images for this request
                var items = await _context.Items
                    .Where(i => i.RequestId == requestId)
                    .ToListAsync();

                // Delete all associated images
                foreach (var item in items) 
                {
                    await DeleteImageAsync(item.Image);
                }

                // Delete the request (which will cascade delete items)
                var request = await _context.Requests
                    .FirstOrDefaultAsync(r => r.RequestId == requestId);

                if (request == null)
                    return false;

                _context.Requests.Remove(request);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error deleting request and associated images for RequestId: {RequestId}", requestId);
                throw;
            }
        }

        public async Task<IEnumerable<Request>> GetAllRequestsAsync()
        {
            return await _context.Requests.ToListAsync();
        }
    }
}