using api.DAL.Models;
using api.DAL.DTOs.Item;
using api.DAL.Interfaces;
using api.DAL.Enum;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemController : ControllerBase
    {
        private readonly IItemRepository _itemRepository;
        private readonly IRequestRepository _requestRepository;
        private readonly ILogger<ItemController> _logger;

        public ItemController(
            IItemRepository itemRepository,
            IRequestRepository requestRepository,
            ILogger<ItemController> logger)
        {
            _itemRepository = itemRepository;
            _requestRepository = requestRepository;
            _logger = logger;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateItem([FromBody] CreateItemDTO itemDTO)
        {
            _logger.LogInformation("Attempting to create item for request {RequestId}", itemDTO.RequestId);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for item creation");
                return BadRequest(ModelState);
            }

            try
            {
                // Verify that the request exists
                var request = await _requestRepository.GetRequestByIdAsync(itemDTO.RequestId);
                if (request == null)
                {
                    _logger.LogWarning("Request {RequestId} not found", itemDTO.RequestId);
                    return NotFound(new { message = "Request not found." });
                }

                // Verify that the request is owned by the user
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (request.SenderEmail != email)
                {
                    _logger.LogWarning("User {UserEmail} does not own request {RequestId}", email, itemDTO.RequestId);
                    return Unauthorized(new { message = "You do not have permission to create an item for this request." });
                }

                var item = new Item
                {
                    RequestId = itemDTO.RequestId,
                    ItemName = itemDTO.ItemName,
                    ItemType = itemDTO.ItemType,
                    Description = itemDTO.Description,
                    Price = itemDTO.Price,
                    Request = request,
                    Image = itemDTO.Image,
                    Width = itemDTO.Width,
                    Height = itemDTO.Height,
                    Depth = itemDTO.Depth
                };

                var createdItem = await _itemRepository.CreateItemAsync(item);
                _logger.LogInformation("Successfully created item {ItemId} for request {RequestId}", 
                    createdItem.ItemId, itemDTO.RequestId);
                    
                return Ok(createdItem);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating item for request {RequestId}", itemDTO.RequestId);
                return StatusCode(500, new { message = "An error occurred while creating the item." });
            }
        }

        [HttpGet("request/{requestId}")]
        public async Task<IActionResult> GetItemsByRequest(int requestId)
        {
            try
            {
                var items = await _itemRepository.GetItemsByRequestIdAsync(requestId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching items for request {RequestId}", requestId);
                return StatusCode(500, new { message = "An error occurred while fetching items." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(int id)
        {
            try
            {
                var item = await _itemRepository.GetItemByIdAsync(id);
                if (item == null)
                    return NotFound(new { message = "Item not found." });

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching item {ItemId}", id);
                return StatusCode(500, new { message = "An error occurred while fetching the item." });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateItemDTO itemDTO)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for item update");
                return BadRequest(ModelState);
            }
            
            try
            {
                var item = await _itemRepository.GetItemByIdAsync(id);
                if (item == null)
                    return NotFound(new { message = "Item not found." });

                // Verify that the request is owned by the user
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (item.Request.SenderEmail != email)
                {
                    _logger.LogWarning("User {UserEmail} does not own request {RequestId}", email, item.RequestId);
                    return Unauthorized(new { message = "You do not have permission to update this item." });
                }

                item.ItemName = itemDTO.ItemName;
                item.ItemType = itemDTO.ItemType;
                item.Description = itemDTO.Description;
                item.Price = itemDTO.Price;
                item.Image = itemDTO.Image;
                item.Width = itemDTO.Width;
                item.Height = itemDTO.Height;
                item.Depth = itemDTO.Depth;

                var updatedItem = await _itemRepository.UpdateItemAsync(item);
                _logger.LogInformation("Successfully updated item {ItemId}", id);

                return Ok(updatedItem);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating item {ItemId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the item." });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteItem(int id)
        {
            try
            {
                var item = await _itemRepository.GetItemByIdAsync(id);
                if (item == null)
                    return NotFound(new { message = "Item not found." });

                // Verify that the request is owned by the user
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (item.Request.SenderEmail != email)
                {
                    _logger.LogWarning("User {UserEmail} does not own request {RequestId}", email, item.RequestId);
                    return Unauthorized(new { message = "You do not have permission to delete this item." });
                }

                var deleted = await _itemRepository.DeleteItemAsync(id);
                if (!deleted)
                    return StatusCode(500, new { message = "An error occurred while deleting the item." });

                _logger.LogInformation("Successfully deleted item {ItemId}", id);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting item {ItemId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the item." });
            }
        }
    }
}