using api.DAL.Models;
using api.DAL.DTOs;
using api.DAL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    //indicate that this is an API controller and that the route for this controller is api/[controller]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        // Declare the repository and logger
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UserController> _logger;

        // Constructor that recieves the repository and logger via dependency injection
        public UserController(IUserRepository userRepository, ILogger<UserController> logger)
        {
            _userRepository = userRepository; //initialize the repository to handle the database operations
            _logger = logger; //Initialize the logger to log messages
        }
        //Define an HTTP POST method for registering a new user
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegistrationDTO registrationDTO)
        {
            // Log the start of the registration process
            _logger.LogInformation("Starting registration process for {Email}", registrationDTO.Email);

            // Check if the incoming data (registrationDTO) is valid based on the validation attributes in UserRegistrationDTO
            if (!ModelState.IsValid)
            {
                // Log a warning if the data is invalid
                _logger.LogWarning("Registration failed for {Email} due to invalid model state", registrationDTO.Email);
                //Extract the error messages from the model state and return them
                var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                // Return a 400 BadRequest response with validation error details
                return BadRequest(new { message = "Validation failed.", errors });
            }

            try
            {
                // Check if a user with the same email already exists in the database
                var existingUser = await _userRepository.GetUserByEmailAsync(registrationDTO.Email);

                // If a user with the same email is found, return a conflict response
                if (existingUser != null)
                {
                    // Log a warning that the email is already in use
                    _logger.LogWarning("Registration failed for {Email} - Email is already in use", registrationDTO.Email);
                    // Return a 409 Conflict response indicating the email is taken
                    return Conflict(new { message = "Email is already in use." });
                }

                // Create a new User object using the data from the registration DTO
                var newUser = new User
                {
                    Name = registrationDTO.Name, // Set the Name property
                    Email = registrationDTO.Email, // Set the Email property
                    Password = BCrypt.Net.BCrypt.HashPassword(registrationDTO.Password) // Hash the password
                };

                // Add the new user to the database using the repository
                await _userRepository.AddUserAsync(newUser);

                // Log that the registration was successful
                _logger.LogInformation("Registration successful for {Email}", registrationDTO.Email);
                // Return a 200 OK response with a success message
                return Ok(new { message = "Registration successful!" });
            }
            catch (Exception ex)
            {
                // Log the exception if something goes wrong
                _logger.LogError(ex, "An error occurred while registering {Email}", registrationDTO.Email);
                // Return a 500 Internal Server Error response
                return StatusCode(500, new { message = "An internal server error occurred. Please try again later." });
            }
        }


        // Define an HTTP POST method for logging in a user
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDTO loginDTO)
        {
            // Log the start of the login process
            _logger.LogInformation("Starting login process for {Email}", loginDTO.Email);

            // Check if the incoming data (loginDTO) is valid based on the validation attributes in UserLoginDTO
            if (!ModelState.IsValid)
            {
                // Log a warning if the data is invalid
                _logger.LogWarning("Login failed for {Email} due to invalid model state", loginDTO.Email);
                // Return a 400 BadRequest response with validation error details
                return BadRequest(ModelState);
            }

            try
            {
                // Get the user from the database using the repository
                var user = await _userRepository.GetUserByEmailAsync(loginDTO.Email);

                // If no user is found with the provided email, return a 404 Not Found response
                if (user == null)
                {
                    // Log a warning that the email was not found
                    _logger.LogWarning("Login failed for {Email} - Email not found", loginDTO.Email);
                    // Return a 404 Not Found response with a message
                    return NotFound(new { message = "Email not found." });
                }

                // Check if the provided password matches the user's password
                if (!BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.Password)) // Verify the password
                {
                    // Log a warning that the password is incorrect
                    _logger.LogWarning("Login failed for {Email} - Incorrect password", loginDTO.Email);
                    // Return a 401 Unauthorized response with a message
                    return Unauthorized(new { message = "Incorrect password." });
                }

                // Log that the login was successful
                _logger.LogInformation("Login successful for {Email}", loginDTO.Email);
                // Return a 200 OK response with a success message
                return Ok(new { name = user.Name, email = user.Email });
            }
            catch (Exception ex)
            {
                // Log the exception if something goes wrong
                _logger.LogError(ex, "An error occurred while logging in {Email}", loginDTO.Email);
                // Return a 500 Internal Server Error response
                return StatusCode(500, new { message = "An internal server error occurred. Please try again later." });
            }


        }
    }
}