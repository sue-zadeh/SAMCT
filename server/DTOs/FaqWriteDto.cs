using System.ComponentModel.DataAnnotations;

namespace server.DTOs;

// Only public FAQ content is accepted; never bind private resident data here.
public sealed class FaqWriteDto
{
    [Required, StringLength(20)]
    public string Village { get; set; } = "";

    [Required, StringLength(160)]
    public string Title { get; set; } = "";

    [Required, StringLength(5000)]
    public string Description { get; set; } = "";

    [Required, StringLength(160)]
    public string SourceLabel { get; set; } = "SAMCT";

    public bool IsPublished { get; set; }
}

public sealed class PublicationDto
{
    public bool IsPublished { get; set; }
}
