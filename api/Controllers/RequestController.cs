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

                // Always set the initial status to Draft on creation
                var request = new Request
                {
                    SenderEmail = email,
                    PickupLocation = requestDTO.PickupLocation,
                    DropoffLocation = requestDTO.DropoffLocation,
                    Description = requestDTO.Description,
                    ScheduledAt = requestDTO.ScheduledAt,
                    AlternateDate = requestDTO.AlternateDate,
                    Status = RequestStatus.Draft, 
                    Sender = user
                };

                var createdRequest = await _requestRepository.CreateRequestAsync(request);
                return Ok(new
                {
                    requestId = createdRequest.RequestId,
                    senderEmail = createdRequest.SenderEmail,
                    pickupLocation = createdRequest.PickupLocation,
                    dropoffLocation = createdRequest.DropoffLocation,
                    description = createdRequest.Description,
                    scheduledAt = createdRequest.ScheduledAt,
                    alternateDate = createdRequest.AlternateDate,
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

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateRequest(int id, [FromBody] UpdateRequestDTO requestDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var request = await _requestRepository.GetRequestByIdAsync(id);
                if (request == null)
                    return NotFound(new { message = "Request not found." });

                // Only allow updates if status is Draft
                if (request.Status != RequestStatus.Draft)
                {
                    return BadRequest(new { message = "Can only edit requests in Draft status." });
                }

                request.PickupLocation = requestDTO.PickupLocation;
                request.DropoffLocation = requestDTO.DropoffLocation;
                request.Description = requestDTO.Description;
                request.ScheduledAt = requestDTO.ScheduledAt;
                request.AlternateDate = requestDTO.AlternateDate;

                var updatedRequest = await _requestRepository.UpdateRequestAsync(request);
                return Ok(updatedRequest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating request {RequestId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the request." });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteRequest(int id)
        {
            try
            {
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                var request = await _requestRepository.GetRequestByIdAsync(id);
                if (request == null)
                    return NotFound(new { message = "Request not found." });

                if (request.SenderEmail != email)
                    return Unauthorized(new { message = "Unauthorized." });

                var success = await _requestRepository.DeleteRequestAsync(id);
                if (success)
                    return Ok(new { message = "Request deleted successfully." });
                else
                    return StatusCode(500, new { message = "An error occurred while deleting the request." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting request {RequestId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the request." });
            }
        }

        [HttpPatch("{id}")]
        [Authorize]
        public async Task<IActionResult> AssignDriver(int id)
        {
            try
            {
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                // if user has driver role
                if (!User.IsInRole("Driver"))
                {
                    return Unauthorized(new { message = "Unauthorized." });
                }

                var updatedRequest = await _requestRepository.AssignDriverToRequestAsync(id, email);
                if (updatedRequest == null)
                {
                    return NotFound($"Request with ID {id} not found.");
                }
                return Ok(updatedRequest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning driver to request with ID {RequestId}", id);
                return StatusCode(500, "An error occurred while assigning the driver.");
            }
        }

        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateRequestStatus(int id, [FromBody] string newStatus)
        {
            try
            {
                var status = Enum.Parse<RequestStatus>(newStatus, true);
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                var request = await _requestRepository.GetRequestByIdAsync(id);
                if (request == null)
                    return NotFound(new { message = "Request not found." });
                if (status == RequestStatus.Completed && request.DriverEmail != email)
                    return Unauthorized(new { message = "Unauthorized." });
                if (status == RequestStatus.Cancelled && request.SenderEmail != email)
                    return Unauthorized(new { message = "Unauthorized." });

                var updatedRequest = await _requestRepository.UpdateRequestStatusAsync(id, status);
                return Ok(updatedRequest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating request status for request with ID {RequestId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the request status." });
            }
        }
    }
}