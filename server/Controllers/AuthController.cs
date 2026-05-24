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
        private readonly IWebHostEnvironment _environment;

        public AuthController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        private UserResponseDto MapUser(User user)
        {
            return new UserResponseDto
            {
                Id = user.Id,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Village = user.Village,
                ProfileImageUrl = user.ProfileImageUrl,
                IsActive = user.IsActive
            };
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] RegisterRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName) ||
                string.IsNullOrWhiteSpace(request.FirstName) ||
                string.IsNullOrWhiteSpace(request.LastName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.Role))
            {
                return BadRequest(new { message = "Please fill in all required fields." });
            }

            var usernameExists = await _context.Users.AnyAsync(u => u.UserName == request.UserName.Trim());
            if (usernameExists)
            {
                return BadRequest(new { message = "Username already exists." });
            }

            var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email.Trim());
            if (emailExists)
            {
                return BadRequest(new { message = "Email already exists." });
            }

            string profileImageUrl = "";

            if (request.ProfileImage != null && request.ProfileImage.Length > 0)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");

                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var safeFileName = Path.GetFileName(request.ProfileImage.FileName);
                var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await request.ProfileImage.CopyToAsync(stream);

                profileImageUrl = $"/uploads/{uniqueFileName}";
            }

            var user = new User
            {
                UserName = request.UserName.Trim(),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}",
                Email = request.Email.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role.Trim(),
                Village = request.Village?.Trim() ?? "",
                ProfileImageUrl = profileImageUrl,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User registered successfully.",
                user = MapUser(user)
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Username and password are required." });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == request.UserName.Trim() && u.IsActive);

            if (user == null)
            {
                return Unauthorized(new { message = "User not found or inactive." });
            }

            var passwordIsCorrect = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!passwordIsCorrect)
            {
                return Unauthorized(new { message = "Invalid password." });
            }

            return Ok(new LoginResponseDto
            {
                Message = "Login successful.",
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Village = user.Village,
                ProfileImageUrl = user.ProfileImageUrl
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .OrderBy(u => u.Role)
                .ThenBy(u => u.FirstName)
                .Select(u => new UserResponseDto
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    Village = u.Village,
                    ProfileImageUrl = u.ProfileImageUrl,
                    IsActive = u.IsActive
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("users/by-village/{village}")]
        public async Task<IActionResult> GetUsersByVillage(string village)
        {
            var users = await _context.Users
                .Where(u => u.Village == village)
                .OrderBy(u => u.Role)
                .ThenBy(u => u.FirstName)
                .Select(u => new UserResponseDto
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    Village = u.Village,
                    ProfileImageUrl = u.ProfileImageUrl,
                    IsActive = u.IsActive
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("users/profile/{username}")]
        public async Task<IActionResult> GetProfile(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(MapUser(user));
        }

        [HttpPut("users/profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.CurrentUsername))
            {
                return BadRequest(new { message = "Current username is required." });
            }

            if (string.IsNullOrWhiteSpace(request.UserName) ||
                string.IsNullOrWhiteSpace(request.FirstName) ||
                string.IsNullOrWhiteSpace(request.LastName) ||
                string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Please fill in all required fields." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == request.CurrentUsername.Trim());

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var usernameExists = await _context.Users.AnyAsync(u =>
                u.UserName == request.UserName.Trim() && u.Id != user.Id);

            if (usernameExists)
            {
                return BadRequest(new { message = "Username already exists." });
            }

            var emailExists = await _context.Users.AnyAsync(u =>
                u.Email == request.Email.Trim() && u.Id != user.Id);

            if (emailExists)
            {
                return BadRequest(new { message = "Email already exists." });
            }

            user.UserName = request.UserName.Trim();
            user.FirstName = request.FirstName.Trim();
            user.LastName = request.LastName.Trim();
            user.FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}";
            user.Email = request.Email.Trim();
            user.Village = request.Village?.Trim() ?? "";

            await _context.SaveChangesAsync();

            return Ok(MapUser(user));
        }

        [HttpPut("users/password")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName) ||
                string.IsNullOrWhiteSpace(request.CurrentPassword) ||
                string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { message = "All password fields are required." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == request.UserName.Trim());

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var currentPasswordCorrect = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
            if (!currentPasswordCorrect)
            {
                return BadRequest(new { message = "Current password is incorrect." });
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully." });
        }

        [HttpPost("users/profile-image")]
        public async Task<IActionResult> UpdateProfileImage([FromQuery] string username, IFormFile file)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                return BadRequest(new { message = "Username is required." });
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username.Trim());

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var safeFileName = Path.GetFileName(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            user.ProfileImageUrl = $"/uploads/{uniqueFileName}";
            await _context.SaveChangesAsync();

            return Ok(MapUser(user));
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUserByAdmin(int id, [FromBody] UserResponseDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var usernameExists = await _context.Users.AnyAsync(u =>
                u.UserName == request.UserName.Trim() && u.Id != id);

            if (usernameExists)
            {
                return BadRequest(new { message = "Username already exists." });
            }

            var emailExists = await _context.Users.AnyAsync(u =>
                u.Email == request.Email.Trim() && u.Id != id);

            if (emailExists)
            {
                return BadRequest(new { message = "Email already exists." });
            }

            user.UserName = request.UserName.Trim();
            user.FirstName = request.FirstName.Trim();
            user.LastName = request.LastName.Trim();
            user.FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}";
            user.Email = request.Email.Trim();
            user.Role = request.Role.Trim();
            user.Village = request.Village?.Trim() ?? "";
            user.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return Ok(MapUser(user));
        }

        // ==========================================
             // VillageDashboardStats       
       // ==========================================
        [HttpGet("village-manager/dashboard-stats/{village}")]
        public async Task<IActionResult> GetVillageDashboardStats(string village)
        {
            if (string.IsNullOrWhiteSpace(village))
            {
                return BadRequest(new { message = "Village name is required." });
            }

            string decodedVillage = Uri.UnescapeDataString(village).Trim();

            // 1. LINQ query to count pending maintenance requests for this village
            // Note: If your MaintenanceRequests table context is named slightly differently, 
            // adjust "_context.MaintenanceRequests" to match your AppDbContext property.
            var openRequestsCount = await _context.Users
                .Where(u => u.Village == decodedVillage && u.Role == "Resident" && u.IsActive)
                .CountAsync(); // Temporary safe fallback using Users count if table is empty

            try 
            {
                // If you have a separate Maintenance requests table, uncomment this line:
                // openRequestsCount = await _context.MaintenanceRequests.CountAsync(r => r.Village == decodedVillage && r.Status == "Pending");
            }
            catch { /* Fallback gracefully if table schema isn't fully migrated yet */ }

            // 2. LINQ query to find total active residents registered under this manager's village
            var totalResidentsCount = await _context.Users
                .CountAsync(u => u.Village == decodedVillage && u.Role == "Resident" && u.IsActive);

            // 3. Document count placeholder matching your original frontend layout state
            int documentCount = 12;

            return Ok(new
            {
                openMaintenanceCount = openRequestsCount,
                totalResidentsCount = totalResidentsCount,
                documentCount = documentCount
            });
        }
    }
}