using api.DAL.Models;
using api.DAL.DTOs.User;
using api.DAL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UserController> _logger;
        private readonly IConfiguration _configuration;

        private readonly string _uploadDirectory;

        public UserController(IUserRepository userRepository, ILogger<UserController> logger, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _logger = logger;
            _configuration = configuration;
            _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Images");
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] UserRegistrationDTO registrationDTO)
        {
            _logger.LogInformation("Starting registration process for {Email}", registrationDTO.Email);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Registration failed for {Email} due to invalid model state", registrationDTO.Email);
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(new { message = "Validation failed.", errors });
            }

            try
            {
                var existingUser = await _userRepository.GetUserByEmailAsync(registrationDTO.Email);
                if (existingUser != null)
                {
                    _logger.LogWarning("Registration failed for {Email} - Email is already in use", registrationDTO.Email);
                    return Conflict(new { message = "Email is already in use." });
                }

                var newUser = new User
                {
                    Name = registrationDTO.Name,
                    Email = registrationDTO.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(registrationDTO.Password)
                };

                await _userRepository.AddUserAsync(newUser);
                _logger.LogInformation("Registration successful for {Email}", registrationDTO.Email);
                return Ok(new { message = "Registration successful!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while registering {Email}", registrationDTO.Email);
                return StatusCode(500, new { message = "An internal server error occurred. Please try again later." });
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] UserLoginDTO loginDTO)
        {
            _logger.LogInformation("Starting login process for {Email}", loginDTO.Email);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Login failed for {Email} due to invalid model state", loginDTO.Email);
                return BadRequest(ModelState);
            }

            try
            {
                var user = await _userRepository.GetUserByEmailAsync(loginDTO.Email);
                if (user == null)
                {
                    _logger.LogWarning("Login failed for {Email} - Email not found", loginDTO.Email);
                    return NotFound(new { message = "Email not found." });
                }

                if (!BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.Password))
                {
                    _logger.LogWarning("Login failed for {Email} - Incorrect password", loginDTO.Email);
                    return Unauthorized(new { message = "Incorrect password." });
                }

                // Generate JWT Token
                var token = GenerateJwtToken(user);

                _logger.LogInformation("Login successful for {Email}", loginDTO.Email);
                return Ok(new { token, name = user.Name, email = user.Email });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while logging in {Email}", loginDTO.Email);
                return StatusCode(500, new { message = "An internal server error occurred. Please try again later." });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, "User") // Always assign "User" role
            };

            // Assign "Driver" role if the user is a driver
            if (user.IsDriver)
            {
                claims.Add(new Claim(ClaimTypes.Role, "Driver"));
            }

            // Assign "Admin" role if the user is an admin
            if (user.Email == "admin")
            {
                claims.Add(new Claim(ClaimTypes.Role, "Admin"));
            }

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(double.Parse(jwtSettings["ExpiryMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        //Get User profile
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetUserProfile()
        {
            try
            {
                //Extract email from the "JWT" Token's 'sub' claim
                var email = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
                if (email == null)
                {
                    return Unauthorized(new { message = "Unauthorized" });
                }
                //fetch the user details from the repository
                // kode her...
                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                //Return the User's profile details
                // kode her...
                var userProfile = new
                {
                    Name = user.Name,
                    Email = user.Email

                };

                return Ok(userProfile);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching user profile");
                return StatusCode(500, new { message = "An internal server error occurred. Please try again later." });
            }
        }

        // need to add profile picture
        [HttpPut("update-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromForm] UserUpdateDTO updateDTO)
        {
            try
            {
                //Extract email from the "JWT" Token's 'sub' claim
                var email = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
                if (email == null)
                {
                    return Unauthorized(new { message = "Unauthorized" });
                }

                //fetch the user details from the repository
                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                if (email != user.Email)
                {
                    return Unauthorized(new { message = "Unauthorized" });
                }

                //Update the user's profile details
                user.Name = updateDTO.Name;
                 // Handle image upload
                string? imageUrl = null;
                if (updateDTO.ImageFile != null && updateDTO.ImageFile.Length > 0)
                {
                    var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
                    if (!allowedTypes.Contains(updateDTO.ImageFile.ContentType.ToLower()))
                    {
                        return BadRequest("Invalid file type. Only JPEG, PNG and GIF are allowed.");
                    }

                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(updateDTO.ImageFile.FileName)}";
                    var filePath = Path.Combine(_uploadDirectory, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await updateDTO.ImageFile.CopyToAsync(stream);
                    }

                    imageUrl = $"/Uploads/Images/{fileName}";
                }

                // Delete old profile picture if it exists
                if (!string.IsNullOrEmpty(user.Image))
                {
                    var oldFileName = Path.GetFileName(user.Image);
                    var oldFilePath = Path.Combine(_uploadDirectory, oldFileName);

                    if (System.IO.File.Exists(oldFilePath))
                    {
                        _logger.LogInformation("Deleting old profile picture: {OldFilePath}", oldFilePath);
                        System.IO.File.Delete(oldFilePath);
                    }
                    else
                    {
                        _logger.LogWarning("Old profile picture not found at path: {OldFilePath}", oldFilePath);
                    }
                }

                // Update user's profile picture URL
                if (imageUrl != null)
                {
                    user.Image = imageUrl;
                }

                await _userRepository.UpdateUserAsync(user);

                return Ok(new { message = "Profile updated successfully", image = user.Image });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating user profile");
                return StatusCode(500, new { message = "An internal server error occurred. Please try again later." });
            }
        }
    
        [HttpDelete("delete-profile")]
        [Authorize]
        public async Task<IActionResult> DeleteProfile()
        {
            try
            {
                //Extract email from the "JWT" Token's 'sub' claim
                var email = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
                if (email == null)
                {
                    return Unauthorized(new { message = "Unauthorized" });
                }

                //fetch the user details from the repository
                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                if (email != user.Email)
                {
                    return Unauthorized(new { message = "Unauthorized" });
                }

                //Delete the user's profile
                await _userRepository.DeleteUserAsync(email);

                return Ok(new { message = "Profile deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting user profile");
                return StatusCode(500, new { message = "An internal server error occurred. Please try again later." });
            }
        }
    }
}