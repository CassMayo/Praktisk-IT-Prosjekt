using api.DAL.Models;
using api.DAL.Interfaces;
using Microsoft.EntityFrameworkCore;
namespace api.DAL.Repositories
{ 
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        private readonly ILogger<UserRepository> _logger;
        private readonly string _uploadDirectory;

        public UserRepository(AppDbContext context, ILogger<UserRepository> logger)
        {
             {
            _context = context;
            _logger = logger;
            // Set the upload directory for images
            _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Images");
            
        }

        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            // Use Entity Framework's DbSet to retrieve all users asynchronously
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<bool> AddUserAsync(User user)
        {
            // Adds the new user to the Users DbSet
            _context.Users.Add(user);
            
            // Saves the changes asynchronously and returns true if any rows were affected
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            // Updates the existing user in the Users DbSet
            _context.Users.Update(user);
            
            // Saves the changes asynchronously and returns true if any rows were affected
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteUserAsync(string email)
        {
            // Finds the user by email first
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            
            // If user exists, remove from the DbSet and save the changes
            if (user != null)
            {
                _context.Users.Remove(user);
                return await _context.SaveChangesAsync() > 0;
            }
            
            // If no user found, return false
            return false;
        }

        

    }
}
