using System.ComponentModel.DataAnnotations;
namespace server.DTOs;
public class DocumentWriteDto
{
    [Required, StringLength(160)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string Title { get; set; } = "";
    [Required, RegularExpression("Notice|Minutes|Consultation Minutes|Code of Practice|Village Data|General Document")] [DisplayFormat(ConvertEmptyStringToNull = false)] public string Type { get; set; } = "Notice";
    [Required, StringLength(2000)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string Description { get; set; } = "";
    [StringLength(60)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string Village { get; set; } = "";
    public bool IsVisibleToResidents { get; set; }
    public IFormFile? File { get; set; }
}
