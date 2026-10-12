using System.ComponentModel.DataAnnotations;

namespace server.DTOs;

public class MarketingContentWriteDto : IValidatableObject
{
    [Required, StringLength(160)] public string Title { get; set; } = "";
    [Required, StringLength(5000)] public string Description { get; set; } = "";
    [StringLength(250), DisplayFormat(ConvertEmptyStringToNull = false)] public string Address { get; set; } = "";
    [StringLength(100), DisplayFormat(ConvertEmptyStringToNull = false)] public string ContactName { get; set; } = "";
    [StringLength(32), RegularExpression(@"\+?[0-9 ()-]{6,32}"), DisplayFormat(ConvertEmptyStringToNull = false)]
    public string ContactPhone { get; set; } = "";
    [Range(0, 9999999999)] public decimal? PriceNzd { get; set; }
    [Required, RegularExpression("Enquire|Applications invited|Under offer|Unavailable")] public string Availability { get; set; } = "Enquire";
    [Required, StringLength(160)] public string SourceLabel { get; set; } = "";
    public bool IsPublished { get; set; }
    [MaxLength(30)] public List<string> RetainedImages { get; set; } = [];
    [MaxLength(10)] public List<IFormFile> Photos { get; set; } = [];

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(ContactName) != string.IsNullOrWhiteSpace(ContactPhone))
            yield return new ValidationResult("Enter both the contact name and phone number, or leave both empty.", [nameof(ContactName), nameof(ContactPhone)]);
        if (!string.IsNullOrWhiteSpace(ContactPhone) && ContactPhone.Count(char.IsDigit) < 6)
            yield return new ValidationResult("Enter a valid contact phone number.", [nameof(ContactPhone)]);
    }
}
