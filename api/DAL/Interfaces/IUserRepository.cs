using api.DAL.Models;

namespace api.DAL.Interfaces
{
    public interface IUserRepository
    {
        //ps: jeg co-pilota d her --> reply j: så mye redundant, removed that shit
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> GetUserByEmailAsync(string email);
        Task<bool> AddUserAsync(User user);
        Task<bool> UpdateUserAsync(User user);
        Task<bool> DeleteUserAsync(string email);
    }
}