using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName) ||
                string.IsNullOrWhiteSpace(request.FirstName) ||
                string.IsNullOrWhiteSpace(request.LastName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.Role) ||
                string.IsNullOrWhiteSpace(request.Village))
            {
                return BadRequest(new { message = "All required fields must be filled." });
            }

            var existingUserByEmail = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (existingUserByEmail != null)
            {
                return BadRequest(new { message = "Email is already in use." });
            }

            var existingUserByUserName = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == request.UserName);

            if (existingUserByUserName != null)
            {
                return BadRequest(new { message = "Username is already in use." });
            }

            var user = new User
            {
                UserName = request.UserName,
                FirstName = request.FirstName,
                LastName = request.LastName,
                FullName = $"{request.FirstName} {request.LastName}",
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role,
                Village = request.Village,
                ProfileImageUrl = string.IsNullOrWhiteSpace(request.ProfileImageUrl)
                    ? "https://via.placeholder.com/80"
                    : request.ProfileImageUrl,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == request.UserName && u.IsActive);

            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var passwordIsCorrect = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!passwordIsCorrect)
            {
                return Unauthorized(new { message = "Invalid password." });
            }

            var response = new LoginResponseDto
            {
                Message = "Login successful",
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                Role = user.Role,
                Village = user.Village,
                ProfileImageUrl = user.ProfileImageUrl
            };

            return Ok(response);
        }
    }
}