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

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UserController> _logger;
        private readonly IConfiguration _configuration;

        public UserController(IUserRepository userRepository, ILogger<UserController> logger, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpPost("register")]
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

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(double.Parse(jwtSettings["ExpiryMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}