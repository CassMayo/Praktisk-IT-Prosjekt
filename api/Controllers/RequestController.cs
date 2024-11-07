using api.DAL.Models;
using api.DAL.DTOs.Request;
using api.DAL.Interfaces;
using api.DAL.Enum;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
        [Authorize]
        public async Task<IActionResult> CreateRequest([FromBody] CreateRequestDTO requestDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (email == null)
                {
                    return Unauthorized(new { message = "Unauthorized." });
                }

                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user == null)
                {
                    return NotFound(new { message = "Sender not found." });
                }

                var request = new Request
                {
                    SenderEmail = email,
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
        [Authorize] // Only authorized users can access this endpoint
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
    
        // search with query parameters
        [HttpGet("search")]
        public async Task<IActionResult> SearchRequests([FromQuery] RequestQuery query)
        {
            try
            {
                var filteredRequests = await _requestRepository.GetRequestsByQueryAsync(query);
                return Ok(filteredRequests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching requests with query {Query}", query);
                return StatusCode(500, new { message = "An error occurred while fetching requests." });
            }
        }
    }
}