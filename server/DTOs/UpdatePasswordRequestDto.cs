using System.ComponentModel.DataAnnotations;

namespace server.DTOs
{
    public class UpdatePasswordRequestDto
    {
        // The server identifies the account from the authenticated token.
        // Kept for backwards-compatible clients but never trusted for authorization.
        [StringLength(80)]
        public string UserName { get; set; } = "";

        [Required, StringLength(128)]
        public string CurrentPassword { get; set; } = "";

        [Required, StringLength(128)]
        public string NewPassword { get; set; } = "";
    }
}
