using api.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace api.DAL
{ 
    //ps: guess what jeg gjorde her, co-pilot
    public class SenderRepository : ISenderRepository
    {
        private readonly SenderDbContext _context;

        public SenderRepository(SenderDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Sender>> GetAllSendersAsync()
        {
            return await _context.Senders.ToListAsync();
        }

        public async Task<Sender> GetSenderByIdAsync(int id)
        {
            var sender = await _context.Senders.FindAsync(id);
            if (sender == null)
            {
                throw new KeyNotFoundException("Sender not found.");
            }
            return sender;
        }

        public async Task<Sender?> GetSenderByEmailAsync(string email)
        {
            return await _context.Senders.FirstOrDefaultAsync(s => s.Email == email);
        }


        public async Task AddSenderAsync(Sender sender)
        {
            _context.Senders.Add(sender);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateSenderAsync(Sender sender)
        {
            _context.Entry(sender).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteSenderAsync(int id)
        {
            var sender = await _context.Senders.FindAsync(id);
            if (sender != null)
            {
                _context.Senders.Remove(sender);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> SenderExistsAsync(int id)
        {
            return await _context.Senders.AnyAsync(s => s.UserId == id);
        }
    }
}
