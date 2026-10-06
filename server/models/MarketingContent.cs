using System.ComponentModel.DataAnnotations;

namespace server.Models;

// Brochure content is independent of resident, occupancy and private property records.
public class MarketingContent
{
    public int Id { get; set; }
    [MaxLength(80)] public string Slug { get; set; } = "";
    [MaxLength(20)] public string Village { get; set; } = "";
    [MaxLength(20)] public string Kind { get; set; } = "";
    [MaxLength(160)] public string Title { get; set; } = "";
    [MaxLength(5000)] public string Description { get; set; } = "";
    [MaxLength(250)] public string Address { get; set; } = "";
    public string[] Images { get; set; } = [];
    public decimal? PriceNzd { get; set; }
    [MaxLength(40)] public string Availability { get; set; } = "Enquire";
    [MaxLength(160)] public string SourceLabel { get; set; } = "";
    public bool IsPublished { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
