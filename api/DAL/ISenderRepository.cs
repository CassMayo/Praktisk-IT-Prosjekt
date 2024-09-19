using System.Collections.Generic;
using System.Threading.Tasks;
using api.Models;

namespace api.DAL
{
    public interface ISenderRepository
    {
        //ps: jeg co-pilota d her
        Task<IEnumerable<Sender>> GetAllSendersAsync();
        Task<Sender> GetSenderByIdAsync(int id);
        Task<Sender?> GetSenderByEmailAsync(string email);
        Task AddSenderAsync(Sender sender);
        Task UpdateSenderAsync(Sender sender);
        Task DeleteSenderAsync(int id);
        Task<bool> SenderExistsAsync(int id);
    }
}
