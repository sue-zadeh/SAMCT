using System.ComponentModel.DataAnnotations;

namespace server.DTOs;

public class MarketingContentWriteDto
{
    [Required, StringLength(160)] public string Title { get; set; } = "";
    [Required, StringLength(5000)] public string Description { get; set; } = "";
    [StringLength(250), DisplayFormat(ConvertEmptyStringToNull = false)] public string Address { get; set; } = "";
    [Range(0, 9999999999)] public decimal? PriceNzd { get; set; }
    [Required, RegularExpression("Enquire|Applications invited|Under offer|Unavailable")] public string Availability { get; set; } = "Enquire";
    [Required, StringLength(160)] public string SourceLabel { get; set; } = "";
    public bool IsPublished { get; set; }
    [MaxLength(10)] public List<string> RetainedImages { get; set; } = [];
    [MaxLength(10)] public List<IFormFile> Photos { get; set; } = [];
}
