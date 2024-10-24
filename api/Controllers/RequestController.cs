using api.DAL.Models;
using api.DAL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RequestController : ControllerBase
    {
        private readonly IRequestRepository _requestRepository;
        private readonly ILogger<RequestController> _logger;
        private readonly IConfiguration _configuration;

        public RequestController(IRequestRepository requestRepository, ILogger<RequestController> logger, IConfiguration configuration)
        {
            _requestRepository = requestRepository;
            _logger = logger;
            _configuration = configuration;
        }

        // Get all requests
        [HttpGet("GetAllRequests")]
        public async Task<IActionResult> GetAllRequests()
        {
            try
            {
                var requests = await _requestRepository.GetAllRequestsAsync();
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all requests");
                return StatusCode(500, new { message = "An error occurred while retrieving requests." });
            }
        }

        // Get a request by ID
        [HttpGet("GetRequest/{id}")]
        public async Task<IActionResult> GetRequestById(int id)
        {
            try
            {
                var request = await _requestRepository.GetRequestByIdAsync(id);
                if (request == null)
                {
                    return NotFound(new { message = "Request not found." });
                }

                return Ok(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving request with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the request." });
            }
        }

        // Create a new request
        [HttpPost("CreateRequest")]
        public async Task<IActionResult> CreateRequest([FromBody] Request request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var success = await _requestRepository.AddRequestAsync(request);
                if (success)
                {
                    return CreatedAtAction(nameof(GetRequestById), new { id = request.RequestId }, request);
                }

                return BadRequest(new { message = "Failed to create request." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating new request");
                return StatusCode(500, new { message = "An error occurred while creating the request." });
            }
        }

        // Update an existing request
        [HttpPut("UpdateRequest/{id}")]
        public async Task<IActionResult> UpdateRequest(int id, [FromBody] Request request)
        {
            try
            {
                if (id != request.RequestId)
                {
                    return BadRequest(new { message = "Request ID mismatch." });
                }

                var success = await _requestRepository.UpdateRequestAsync(request);
                if (success)
                {
                    return NoContent();
                }

                return NotFound(new { message = "Request not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating request with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while updating the request." });
            }
        }

        // Delete a request by ID
        [HttpDelete("DeleteRequest/{id}")]
        public async Task<IActionResult> DeleteRequest(int id)
        {
            try
            {
                var success = await _requestRepository.DeleteRequestAsync(id);
                if (success)
                {
                    return NoContent();
                }

                return NotFound(new { message = "Request not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting request with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the request." });
            }
        }
    }
}
