using api.DAL.Models;
using api.DAL.DTOs.Request;
using api.DAL.Interfaces;
using api.DAL.Enum;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RequestController : ControllerBase
    {
        private readonly IRequestRepository _requestRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<RequestController> _logger;

        public RequestController(
            IRequestRepository requestRepository,
            IUserRepository userRepository,
            ILogger<RequestController> logger)
        {
            _requestRepository = requestRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] CreateRequestDTO requestDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var user = await _userRepository.GetUserByEmailAsync(requestDTO.SenderEmail);
                if (user == null)
                {
                    return NotFound(new { message = "Sender not found." });
                }

                var request = new Request
                {
                    SenderEmail = requestDTO.SenderEmail,
                    PickupLocation = requestDTO.PickupLocation,
                    DropoffLocation = requestDTO.DropoffLocation,
                    Description = requestDTO.Description,
                    ScheduledAt = requestDTO.ScheduledAt,
                    Status = RequestStatus.Pending,
                    Sender = user
                };

                var createdRequest = await _requestRepository.CreateRequestAsync(request);

                // Return the full request details including the ID
                return Ok(new
                {
                    requestId = createdRequest.RequestId,
                    senderEmail = createdRequest.SenderEmail,
                    pickupLocation = createdRequest.PickupLocation,
                    dropoffLocation = createdRequest.DropoffLocation,
                    description = createdRequest.Description,
                    scheduledAt = createdRequest.ScheduledAt,
                    status = createdRequest.Status
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating request");
                return StatusCode(500, new { message = "An error occurred while creating the request." });
            }
        }
        [HttpGet("user/{email}")]
        public async Task<IActionResult> GetUserRequests(string email)
        {
            try
            {
                var requests = await _requestRepository.GetRequestsBySenderAsync(email);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user requests for {Email}", email);
                return StatusCode(500, new { message = "An error occurred while fetching requests." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRequest(int id)
        {
            try
            {
                var request = await _requestRepository.GetRequestByIdAsync(id);
                if (request == null)
                    return NotFound(new { message = "Request not found." });

                return Ok(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching request {RequestId}", id);
                return StatusCode(500, new { message = "An error occurred while fetching the request." });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateRequestStatus(int id, [FromBody] UpdateRequestStatusDTO statusDTO)
        {
            try
            {
                var updatedRequest = await _requestRepository.UpdateRequestStatusAsync(id, statusDTO.Status);
                return Ok(updatedRequest);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Request not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for request {RequestId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the request status." });
            }
        }
        
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllRequests()
        {
            try
            {
                var requests = await _requestRepository.GetAllRequestsAsync();
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all requests");
                return StatusCode(500, new { message = "An error occurred while fetching requests." });
            }
        }
    }
}