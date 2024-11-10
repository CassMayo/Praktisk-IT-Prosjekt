using api.DAL.Models;
using api.DAL.Interfaces;
using Microsoft.EntityFrameworkCore;
namespace api.DAL.Repositories
{
    public class ItemRepository : IItemRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ItemRepository> _logger;

        public ItemRepository(AppDbContext context, ILogger<ItemRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Item> CreateItemAsync(Item item)
        {
            _context.Items.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<IEnumerable<Item>> GetItemsByRequestIdAsync(int requestId)
        {
            return await _context.Items
                .Where(i => i.RequestId == requestId)
                .ToListAsync();
        }

        public async Task<Item?> GetItemByIdAsync(int itemId)
        {
            return await _context.Items
                .Include(i => i.Request)
                .FirstOrDefaultAsync(i => i.ItemId == itemId);
        }

        public async Task<bool> DeleteItemAsync(int itemId)
        {
            var item = await _context.Items.FindAsync(itemId);
            if (item == null)
                return false;

            _context.Items.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Item> UpdateItemAsync(Item item)
        {
            _context.Items.Update(item);
            await _context.SaveChangesAsync();
            return item;
        }
    }
}