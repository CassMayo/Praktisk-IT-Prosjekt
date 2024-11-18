using api.DAL.Models;
using api.DAL.DTOs.Item;
using api.DAL.DTOs.User;
using api.DAL.Interfaces;
using api.DAL.Enum;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IRequestRepository _requestRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            IRequestRepository requestRepository,
            IUserRepository userRepository,
            ILogger<AdminController> logger)
        {
            _requestRepository = requestRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        // Get all users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userRepository.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, new { message = "An error occurred while retrieving users." });
            }
        }

        // Get all requests
        [HttpGet("requests")]
        public async Task<IActionResult> GetAllRequests()
        {
            try
            {
                var requests = await _requestRepository.GetAllRequestsAsync();
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving requests");
                return StatusCode(500, new { message = "An error occurred while retrieving requests." });
            }
        }

        // Delete a request by ID
        [HttpDelete("request/{id}")]
        public async Task<IActionResult> DeleteRequest(int id)
        {
            try
            {
                var success = await _requestRepository.DeleteRequestAsync(id);
                if (success)
                {
                    return Ok(new { message = "Request deleted successfully." });
                }
                else
                {
                    return NotFound(new { message = "Request not found." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting request {RequestId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the request." });
            }
        }

        // Delete a user by email
        [HttpDelete("user/{email}")]
        public async Task<IActionResult> DeleteUser(string email)
        {
            try
            {
                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }

                await _userRepository.DeleteUserAsync(email);
                return Ok(new { message = "User deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {Email}", email);
                return StatusCode(500, new { message = "An error occurred while deleting the user." });
            }
        }

        // Update a user's details
        [HttpPut("user/{email}")]
        public async Task<IActionResult> UpdateUser(string email, [FromBody] UserUpdateDTO updateDTO)
        {
            try
            {
                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }

                user.Name = updateDTO.Name;
                await _userRepository.UpdateUserAsync(user);
                return Ok(new { message = "User updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {Email}", email);
                return StatusCode(500, new { message = "An error occurred while updating the user." });
            }
        }
    }
}