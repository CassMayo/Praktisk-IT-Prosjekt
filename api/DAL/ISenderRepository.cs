using System.Collections.Generic;
using System.Threading.Tasks;
using api.Models;

namespace api.DAL
{
    public interface ISenderRepository
    {
        //ps: jeg co-pilota d her --> reply j: så mye redundant, removed that shit
        Task<IEnumerable<Sender>> GetAllSendersAsync();
        Task<Sender?> GetSenderByEmailAsync(string email);
        Task AddSenderAsync(Sender sender);
        Task UpdateSenderAsync(Sender sender);
        Task DeleteSenderAsync(int id);
    }
}
