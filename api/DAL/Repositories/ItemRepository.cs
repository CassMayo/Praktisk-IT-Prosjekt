using api.DAL.Models;
using api.DAL.Interfaces;
using Microsoft.EntityFrameworkCore;
namespace api.DAL.Repositories
{
    public class ItemRepository : IItemRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ItemRepository> _logger;
        private readonly string _uploadDirectory;

        public ItemRepository(AppDbContext context, ILogger<ItemRepository> logger)
        {
            _context = context;
            _logger = logger;
            // Set the upload directory for images
            _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Images");
            
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
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Get the item to delete 
            var item = await _context.Items
                .Include(i => i.Request)  
                .FirstOrDefaultAsync(i => i.ItemId == itemId);
            // Check if the item exists
            if (item == null)
            {
                _logger.LogWarning("Attempted to delete non-existent item with ID: {ItemId}", itemId);
                return false;
            }

            // Delete the image if it exists
            if (!string.IsNullOrEmpty(item.Image))
            {
                try
                {
                    var fileName = Path.GetFileName(item.Image);
                    var filePath = Path.Combine(_uploadDirectory, fileName);
                    if (File.Exists(filePath))
                    {
                        File.Delete(filePath);
                        _logger.LogInformation("Deleted image file: {FileName}", fileName);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error deleting image file for item {ItemId}", itemId);
                    // Continue with item deletion even if image deletion fails
                }
            }

            // Delete the item
            _context.Items.Remove(item);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            
            _logger.LogInformation("Successfully deleted item {ItemId}", itemId);
            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error deleting item {ItemId}", itemId);
            throw;
        }
    }
        public async Task<Item> UpdateItemAsync(Item item)
        {
            _context.Items.Update(item);
            await _context.SaveChangesAsync();
            return item;
        }
    }
}