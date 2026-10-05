using System.ComponentModel.DataAnnotations;

namespace server.DTOs;

public class MfaCodeDto
{
    [RegularExpression(@"^[0-9]{6}$"), StringLength(6)]
    public string? Code { get; set; }
    [RegularExpression(@"^[a-fA-F0-9-]{32,39}$"), StringLength(39)]
    public string? RecoveryCode { get; set; }
}

public class MfaPasswordDto : MfaCodeDto
{
    [Required, StringLength(72)]
    public string CurrentPassword { get; set; } = "";
}
