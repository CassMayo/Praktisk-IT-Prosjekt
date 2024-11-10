using api.DAL.Models;

namespace api.DAL.Interfaces
{
    public interface IItemRepository
    {
        Task<IEnumerable<Item>> GetItemsByRequestIdAsync(int requestId);
        Task<Item?> GetItemByIdAsync(int itemId);
        Task<Item> CreateItemAsync(Item item);
        Task<Item> UpdateItemAsync(Item item);
        Task<bool> DeleteItemAsync(int itemId);
    }
}