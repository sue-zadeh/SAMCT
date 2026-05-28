namespace server.DTOs
{
    public class CreateDocumentNoticeDto
    {
        public string Title { get; set; } = "";
        public string Type { get; set; } = "Notice";
        public string Description { get; set; } = "";
        public string Village { get; set; } = "";
        public string FileUrl { get; set; } = "";
        public string CreatedByUserName { get; set; } = "";
        public bool IsVisibleToResidents { get; set; } = true;
    }
}