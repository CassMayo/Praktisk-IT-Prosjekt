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
        private readonly string _uploadDirectory;

        public ItemController(
            IItemRepository itemRepository,
            IRequestRepository requestRepository,
            ILogger<ItemController> logger)
        {
            _itemRepository = itemRepository;
            _requestRepository = requestRepository;
            _logger = logger;
            _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Images");

            if (!Directory.Exists(_uploadDirectory))
            {
                Directory.CreateDirectory(_uploadDirectory);
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateItem([FromForm] CreateItemDTO itemDTO)
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

                // Check if request is in draft status
                if (request.Status != RequestStatus.Draft)
                {
                    return BadRequest(new { message = "Can only add items to requests in Draft status." });
                }

                // Handle image upload
                string? imageUrl = null;
                if (itemDTO.ImageFile != null && itemDTO.ImageFile.Length > 0)
                {
                    var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
                    if (!allowedTypes.Contains(itemDTO.ImageFile.ContentType.ToLower()))
                    {
                        return BadRequest("Invalid file type. Only JPEG, PNG and GIF are allowed.");
                    }

                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(itemDTO.ImageFile.FileName)}";
                    var filePath = Path.Combine(_uploadDirectory, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await itemDTO.ImageFile.CopyToAsync(stream);
                    }

                    imageUrl = $"/api/item/image/{fileName}";
                }

                var item = new Item
                {
                    RequestId = itemDTO.RequestId,
                    ItemName = itemDTO.ItemName,
                    ItemType = itemDTO.ItemType,
                    Description = itemDTO.Description,
                    Price = itemDTO.Price,
                    Request = request,
                    Image = imageUrl,
                    Width = itemDTO.Width,
                    Height = itemDTO.Height,
                    Depth = itemDTO.Depth,
                    Weight = itemDTO.Weight
                };

                var createdItem = await _itemRepository.CreateItemAsync(item);

                // Check existing items BEFORE adding this one
                var existingItems = await _itemRepository.GetItemsByRequestIdAsync(itemDTO.RequestId);
                if (!existingItems.Any())
                {
                    // This is the first item, update status to Pending
                    request.Status = RequestStatus.Pending;
                    await _requestRepository.UpdateRequestAsync(request);
                }

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

        [HttpGet("image/{fileName}")]
        public IActionResult GetImage(string fileName)
        {
            try
            {
                var filePath = Path.Combine(_uploadDirectory, fileName);

                if (!System.IO.File.Exists(filePath))
                    return NotFound("Image not found");

                var contentType = "application/octet-stream";
                var extension = Path.GetExtension(fileName).ToLower();
                switch (extension)
                {
                    case ".jpg":
                    case ".jpeg":
                        contentType = "image/jpeg";
                        break;
                    case ".png":
                        contentType = "image/png";
                        break;
                    case ".gif":
                        contentType = "image/gif";
                        break;
                }

                return PhysicalFile(filePath, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving image {FileName}", fileName);
                return StatusCode(500, "Error retrieving image");
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateItem(int id, [FromForm] UpdateItemDTO itemDTO)
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

                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (item.Request.SenderEmail != email)
                {
                    _logger.LogWarning("User {UserEmail} does not own request {RequestId}", email, item.RequestId);
                    return Unauthorized(new { message = "You do not have permission to update this item." });
                }

                // Check if the request is in draft status
                if (item.Request.Status != RequestStatus.Draft)
                {
                    return BadRequest(new { message = "Can only edit items in requests with Draft status." });
                }

                // Handle new image upload if provided
                if (itemDTO.ImageFile != null && itemDTO.ImageFile.Length > 0)
                {
                    var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
                    if (!allowedTypes.Contains(itemDTO.ImageFile.ContentType.ToLower()))
                    {
                        return BadRequest("Invalid file type. Only JPEG, PNG and GIF are allowed.");
                    }

                    // Delete old image if exists
                    if (!string.IsNullOrEmpty(item.Image))
                    {
                        var oldFileName = Path.GetFileName(item.Image);
                        var oldFilePath = Path.Combine(_uploadDirectory, oldFileName);
                        if (System.IO.File.Exists(oldFilePath))
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                    }

                    // Save new image
                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(itemDTO.ImageFile.FileName)}";
                    var filePath = Path.Combine(_uploadDirectory, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await itemDTO.ImageFile.CopyToAsync(stream);
                    }

                    item.Image = $"/api/item/image/{fileName}";
                }
                else
                {
                    // Keep the existing image
                }

                // Update other properties
                item.ItemName = itemDTO.ItemName;
                item.ItemType = itemDTO.ItemType;
                item.Description = itemDTO.Description;
                item.Price = itemDTO.Price;
                item.Width = itemDTO.Width;
                item.Height = itemDTO.Height;
                item.Depth = itemDTO.Depth;
                item.Weight = itemDTO.Weight;

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
            _logger.LogInformation("Delete request received for item ID: {ItemId}", id);
            
            try
            {
                var item = await _itemRepository.GetItemByIdAsync(id);
                
                _logger.LogInformation("Item fetch result: {ItemFound}", item != null ? "Found" : "Not Found");
                
                if (item == null)
                {
                    _logger.LogWarning("Item not found with ID: {ItemId}", id);
                    return NotFound(new { message = "Item not found." });
                }

                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                _logger.LogInformation("User email: {Email}, Item's Request SenderEmail: {SenderEmail}", 
                    email, item.Request?.SenderEmail);
                    
                if (item.Request.SenderEmail != email)
                {
                    _logger.LogWarning("User {UserEmail} does not own request {RequestId}", email, item.RequestId);
                    return Unauthorized(new { message = "You do not have permission to delete this item." });
                }

                // Can only delete items from requests in Draft status
                _logger.LogInformation("Request status: {Status}", item.Request?.Status);
                if (item.Request.Status != RequestStatus.Draft)
                {
                    return BadRequest(new { message = "Can only delete items from requests in Draft status." });
                }

                var deleted = await _itemRepository.DeleteItemAsync(id);
                if (!deleted)
                {
                    _logger.LogError("Failed to delete item {ItemId}", id);
                    return StatusCode(500, new { message = "An error occurred while deleting the item." });
                }

                _logger.LogInformation("Successfully deleted item {ItemId}", id);
                return Ok(new { message = "Item deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting item {ItemId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the item." });
            }
        }

        [HttpGet("request/{requestId}")]
        public async Task<IActionResult> GetItemsByRequestId(int requestId)
        {
            try
            {
                var items = await _itemRepository.GetItemsByRequestIdAsync(requestId);
                if (items == null || !items.Any())
                {
                    return NotFound(new { message = "No items found for this request." });
                }

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
    }
}