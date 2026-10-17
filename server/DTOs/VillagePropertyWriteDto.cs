using System.ComponentModel.DataAnnotations;
namespace server.DTOs;
public class VillagePropertyWriteDto : IValidatableObject
{
    [Required, RegularExpression("Ngatea|Whitianga")] [DisplayFormat(ConvertEmptyStringToNull = false)] public string Village { get; set; } = "";
    [Required, StringLength(30)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string UnitNumber { get; set; } = "";
    [Required, StringLength(250)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string Address { get; set; } = "";
    [Range(0, 20)] public int ResidentCount { get; set; }
    [StringLength(160)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string ResidentName { get; set; } = "";
    [EmailAddress, StringLength(254)] public string? ResidentEmail { get; set; }
    [StringLength(160)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string ResidentOccupation { get; set; } = "";
    [StringLength(160)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string VillageManagerName { get; set; } = "";
    [StringLength(2000)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string Notes { get; set; } = "";
    public bool IsVisibleOnMarketing { get; set; }
    [StringLength(160)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string MarketingTitle { get; set; } = "";
    [StringLength(2000)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string MarketingDescription { get; set; } = "";
    public IFormFile? Document1 { get; set; }
    public IFormFile? Document2 { get; set; }
    public IFormFile? MarketingImage1 { get; set; }
    public IFormFile? MarketingImage2 { get; set; }
    public IFormFile? MarketingImage3 { get; set; }
    public IFormFile? MarketingImage4 { get; set; }
    public IFormFile? MarketingImage5 { get; set; }
    public IFormFile? MarketingImage6 { get; set; }
    public IFormFile? MarketingImage7 { get; set; }
    public IFormFile? MarketingImage8 { get; set; }
    public IFormFile? MarketingImage9 { get; set; }
    public IFormFile? MarketingImage10 { get; set; }
    [MaxLength(10)] public int[] RemoveMarketingImages { get; set; } = [];

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (RemoveMarketingImages is null || RemoveMarketingImages.Any(slot => slot < 1 || slot > 10) ||
            RemoveMarketingImages.Distinct().Count() != RemoveMarketingImages.Length)
            yield return new ValidationResult("Choose unique photo positions from 1 to 10.", [nameof(RemoveMarketingImages)]);
    }
}
