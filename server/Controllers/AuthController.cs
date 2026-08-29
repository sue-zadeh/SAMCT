using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;
using server.Security;
using server.Services;

namespace server.Controllers;

[ApiController]
[Route("api")]
public class AuthController : ControllerBase
{
    private const int BcryptWorkFactor = 12;
    private const long MaximumProfileImageBytes = 5 * 1024 * 1024;
    private const string GenericLoginFailure = "Invalid username or password.";
    private const string DummyPasswordHash =
        "$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe";

    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        AppDbContext context,
        IWebHostEnvironment environment,
        IEmailService emailService,
        IConfiguration configuration,
        ITokenService tokenService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _environment = environment;
        _emailService = emailService;
        _configuration = configuration;
        _tokenService = tokenService;
        _logger = logger;
    }

    private static UserResponseDto MapUser(User user) => new()
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

    [Authorize(Policy = SecurityPolicies.AdminOnly)]
    [HttpPost("register")]
    [RequestSizeLimit(MaximumProfileImageBytes + 64 * 1024)]
    public async Task<IActionResult> Register([FromForm] RegisterRequestDto request)
    {
        var role = request.Role.Trim();
        if (!SamctRoles.AssignableRoles.Contains(role, StringComparer.Ordinal))
        {
            return BadRequest(new { message = "The selected role is not valid." });
        }

        var village = request.Village.Trim();
        if ((role == SamctRoles.Resident || role == SamctRoles.VillageManager) &&
            !IsSupportedVillage(village))
        {
            return BadRequest(new { message = "A valid village is required for this role." });
        }

        var passwordError = PasswordPolicy.Validate(request.Password);
        if (passwordError is not null)
        {
            return BadRequest(new { message = passwordError });
        }

        var userName = request.UserName.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        var normalizedUserName = userName.ToLowerInvariant();

        var usernameExists = await _context.Users
            .AnyAsync(user => user.UserName.ToLower() == normalizedUserName);
        if (usernameExists)
        {
            return Conflict(new { message = "Username already exists." });
        }

        var emailExists = await _context.Users
            .AnyAsync(user => user.Email.ToLower() == email);
        if (emailExists)
        {
            return Conflict(new { message = "Email already exists." });
        }

        var profileImageUrl = request.ProfileImage is null
            ? ""
            : await SaveProfileImage(request.ProfileImage);

        var user = new User
        {
            UserName = userName,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}",
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, BcryptWorkFactor),
            Role = role,
            Village = role is SamctRoles.Resident or SamctRoles.VillageManager ? village : "",
            ProfileImageUrl = profileImageUrl,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Created($"/api/users/{user.Id}", new
        {
            message = "User registered successfully.",
            user = MapUser(user)
        });
    }

    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var normalizedUserName = request.UserName.Trim().ToLowerInvariant();
        var user = await _context.Users
            .FirstOrDefaultAsync(candidate => candidate.UserName.ToLower() == normalizedUserName);

        var hashToVerify = user?.PasswordHash ?? DummyPasswordHash;
        var passwordIsCorrect = BCrypt.Net.BCrypt.Verify(request.Password, hashToVerify);

        if (user is null || !user.IsActive || !passwordIsCorrect)
        {
            _logger.LogWarning(
                "Rejected login attempt for username fingerprint {UserNameLength} from {RemoteIp}.",
                request.UserName.Length,
                HttpContext.Connection.RemoteIpAddress);
            return Unauthorized(new { message = GenericLoginFailure });
        }

        if (BCrypt.Net.BCrypt.PasswordNeedsRehash(user.PasswordHash, BcryptWorkFactor))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, BcryptWorkFactor);
            await _context.SaveChangesAsync();
        }

        var accessToken = _tokenService.CreateAccessToken(user);

        return Ok(new LoginResponseDto
        {
            Message = "Login successful.",
            AccessToken = accessToken.Token,
            ExpiresAtUtc = accessToken.ExpiresAtUtc,
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

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var jwtId = User.GetJwtId();
        if (!string.IsNullOrWhiteSpace(jwtId))
        {
            var alreadyRevoked = await _context.RevokedTokens.AnyAsync(token => token.JwtId == jwtId);
            if (!alreadyRevoked)
            {
                _context.RevokedTokens.Add(new RevokedToken
                {
                    JwtId = jwtId,
                    UserId = User.GetUserId(),
                    RevokedAtUtc = DateTime.UtcNow,
                    ExpiresAtUtc = User.GetTokenExpiryUtc()
                });
            }

            var expiredTokens = await _context.RevokedTokens
                .Where(token => token.ExpiresAtUtc <= DateTime.UtcNow)
                .ToListAsync();
            _context.RevokedTokens.RemoveRange(expiredTokens);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Logout successful." });
    }

    [Authorize(Policy = SecurityPolicies.AdminOnly)]
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .AsNoTracking()
            .OrderBy(user => user.Role)
            .ThenBy(user => user.FirstName)
            .Select(user => new UserResponseDto
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
            })
            .ToListAsync();

        return Ok(users);
    }

    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    [HttpGet("users/by-village/{village}")]
    public async Task<IActionResult> GetUsersByVillage(string village)
    {
        var decodedVillage = Uri.UnescapeDataString(village).Trim();
        if (!User.CanAccessVillage(decodedVillage))
        {
            return Forbid();
        }

        var users = await _context.Users
            .AsNoTracking()
            .Where(user => user.Village == decodedVillage)
            .OrderBy(user => user.Role)
            .ThenBy(user => user.FirstName)
            .Select(user => new UserResponseDto
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
            })
            .ToListAsync();

        return Ok(users);
    }

    [Authorize]
    [HttpGet("users/profile/{username}")]
    public async Task<IActionResult> GetProfile(string username)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(candidate => candidate.UserName == username);

        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        var canRead = User.IsAdmin() ||
            string.Equals(User.GetUserName(), user.UserName, StringComparison.OrdinalIgnoreCase) ||
            (User.IsInRole(SamctRoles.VillageManager) &&
             string.Equals(User.GetVillage(), user.Village, StringComparison.OrdinalIgnoreCase));

        return canRead ? Ok(MapUser(user)) : Forbid();
    }

    [Authorize]
    [HttpPut("users/profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request)
    {
        var userId = User.GetUserId();
        var user = await _context.Users.FirstOrDefaultAsync(candidate => candidate.Id == userId);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (string.IsNullOrWhiteSpace(request.UserName) ||
            string.IsNullOrWhiteSpace(request.FirstName) ||
            string.IsNullOrWhiteSpace(request.LastName) ||
            string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Please fill in all required fields." });
        }

        var normalizedUserName = request.UserName.Trim().ToLowerInvariant();
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var usernameExists = await _context.Users.AnyAsync(candidate =>
            candidate.UserName.ToLower() == normalizedUserName && candidate.Id != userId);
        var emailExists = await _context.Users.AnyAsync(candidate =>
            candidate.Email.ToLower() == normalizedEmail && candidate.Id != userId);

        if (usernameExists || emailExists)
        {
            return Conflict(new { message = "Username or email is already in use." });
        }

        user.UserName = request.UserName.Trim();
        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}";
        user.Email = normalizedEmail;
        // Role and village are intentionally not editable through self-service profile updates.

        await _context.SaveChangesAsync();
        return Ok(MapUser(user));
    }

    [Authorize]
    [HttpPut("users/password")]
    public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequestDto request)
    {
        var passwordError = PasswordPolicy.Validate(request.NewPassword);
        if (passwordError is not null)
        {
            return BadRequest(new { message = passwordError });
        }

        var user = await _context.Users.FirstOrDefaultAsync(candidate => candidate.Id == User.GetUserId());
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Current password is incorrect." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, BcryptWorkFactor);
        user.TokenVersion++;
        await RevokeAllTokensForUser(user.Id);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password updated successfully. Please log in again." });
    }

    [Authorize]
    [HttpPost("users/profile-image")]
    [RequestSizeLimit(MaximumProfileImageBytes + 64 * 1024)]
    public async Task<IActionResult> UpdateProfileImage(IFormFile file)
    {
        var user = await _context.Users.FirstOrDefaultAsync(candidate => candidate.Id == User.GetUserId());
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        user.ProfileImageUrl = await SaveProfileImage(file);
        await _context.SaveChangesAsync();
        return Ok(MapUser(user));
    }

    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    [HttpPut("users/{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UserResponseDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(candidate => candidate.Id == id);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (!User.IsAdmin())
        {
            var managerCanEdit = user.Role == SamctRoles.Resident &&
                string.Equals(user.Village, User.GetVillage(), StringComparison.OrdinalIgnoreCase);
            if (!managerCanEdit)
            {
                return Forbid();
            }

            request.Role = SamctRoles.Resident;
            request.Village = User.GetVillage();
        }
        else if (!SamctRoles.AssignableRoles.Contains(request.Role, StringComparer.Ordinal))
        {
            return BadRequest(new { message = "The selected role is not valid." });
        }

        var normalizedUserName = request.UserName.Trim().ToLowerInvariant();
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var duplicateExists = await _context.Users.AnyAsync(candidate =>
            candidate.Id != id &&
            (candidate.UserName.ToLower() == normalizedUserName ||
             candidate.Email.ToLower() == normalizedEmail));

        if (duplicateExists)
        {
            return Conflict(new { message = "Username or email is already in use." });
        }

        user.UserName = request.UserName.Trim();
        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}";
        user.Email = normalizedEmail;

        var securityBoundaryChanged =
            !string.Equals(user.Role, request.Role, StringComparison.Ordinal) ||
            !string.Equals(user.Village, request.Village?.Trim(), StringComparison.OrdinalIgnoreCase) ||
            user.IsActive != request.IsActive;

        user.Role = request.Role;
        user.Village = request.Village?.Trim() ?? "";
        user.IsActive = request.IsActive;
        if (securityBoundaryChanged) user.TokenVersion++;

        await _context.SaveChangesAsync();
        return Ok(MapUser(user));
    }

    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    [HttpGet("village-manager/dashboard-stats/{village}")]
    public async Task<IActionResult> GetVillageDashboardStats(string village)
    {
        var decodedVillage = Uri.UnescapeDataString(village).Trim();
        if (!User.CanAccessVillage(decodedVillage))
        {
            return Forbid();
        }

        var openMaintenanceCount = await _context.MaintenanceRequests.CountAsync(request =>
            request.Village == decodedVillage && request.Status != "Completed");
        var totalResidentsCount = await _context.Users.CountAsync(user =>
            user.Village == decodedVillage && user.Role == SamctRoles.Resident && user.IsActive);
        var documentCount = await _context.DocumentNotices.CountAsync(document =>
            document.Village == decodedVillage);

        return Ok(new { openMaintenanceCount, totalResidentsCount, documentCount });
    }

    [Authorize(Policy = SecurityPolicies.ManagerOrAdmin)]
    [HttpGet("village/{village}/summary")]
    public async Task<IActionResult> GetVillageSummary(string village)
    {
        var decodedVillage = Uri.UnescapeDataString(village).Trim();
        if (!User.CanAccessVillage(decodedVillage))
        {
            return Forbid();
        }

        var residents = await _context.Users.CountAsync(user =>
            user.Village == decodedVillage && user.Role == SamctRoles.Resident && user.IsActive);
        var managers = await _context.Users.CountAsync(user =>
            user.Village == decodedVillage && user.Role == SamctRoles.VillageManager && user.IsActive);

        return Ok(new { residents, managers });
    }

    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        const string genericMessage = "If this email exists, a reset link has been sent.";
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(candidate =>
            candidate.Email.ToLower() == email && candidate.IsActive);

        if (user is null)
        {
            return Ok(new { message = genericMessage });
        }

        var rawToken = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
        user.PasswordResetToken = HashResetToken(rawToken);
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(30);
        await _context.SaveChangesAsync();

        var frontendUrl = _configuration["EmailSettings:FrontendUrl"]?.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(frontendUrl))
        {
            _logger.LogError("EmailSettings:FrontendUrl is not configured.");
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { message = "Password reset is temporarily unavailable." });
        }

        await _emailService.SendPasswordResetEmail(
            user.Email,
            $"{frontendUrl}/reset-password/{rawToken}");

        return Ok(new { message = genericMessage });
    }

    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    [HttpPut("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        var passwordError = PasswordPolicy.Validate(request.NewPassword);
        if (passwordError is not null)
        {
            return BadRequest(new { message = passwordError });
        }

        var tokenHash = HashResetToken(request.Token);
        var user = await _context.Users.FirstOrDefaultAsync(candidate =>
            candidate.PasswordResetToken == tokenHash &&
            candidate.PasswordResetTokenExpiry > DateTime.UtcNow &&
            candidate.IsActive);

        if (user is null)
        {
            return BadRequest(new { message = "Invalid or expired reset link." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, BcryptWorkFactor);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        user.TokenVersion++;
        await RevokeAllTokensForUser(user.Id);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully. Please log in." });
    }

    private static bool IsSupportedVillage(string village) =>
        village is "Ngatea" or "Whitianga";

    private static string HashResetToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private async Task RevokeAllTokensForUser(int userId)
    {
        // TokenVersion invalidates every prior token. The deny-list below also makes
        // logout and the current password-change request effective immediately.
        var currentJwtId = User.GetJwtId();
        if (!string.IsNullOrWhiteSpace(currentJwtId) &&
            !await _context.RevokedTokens.AnyAsync(token => token.JwtId == currentJwtId))
        {
            _context.RevokedTokens.Add(new RevokedToken
            {
                JwtId = currentJwtId,
                UserId = userId,
                RevokedAtUtc = DateTime.UtcNow,
                ExpiresAtUtc = User.GetTokenExpiryUtc()
            });
        }
    }

    private async Task<string> SaveProfileImage(IFormFile file)
    {
        if (file.Length <= 0 || file.Length > MaximumProfileImageBytes)
        {
            throw new BadHttpRequestException("Profile image must be smaller than 5 MB.");
        }

        var extension = file.ContentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => throw new BadHttpRequestException("Only JPG, PNG, and WebP images are allowed.")
        };

        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var uploadsFolder = Path.Combine(webRoot, "uploads", "profiles");
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);
        await using var stream = new FileStream(filePath, FileMode.CreateNew);
        await file.CopyToAsync(stream);

        return $"/uploads/profiles/{fileName}";
    }
}
