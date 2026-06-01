namespace server.DTOs
{
    public class CreateMaintenanceRequestDto
    {
        public string UserName { get; set; } = "";
        public string Village { get; set; } = "";
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string UnitOrAddress { get; set; } = "";
        public string Priority { get; set; } = "Normal";
        public IFormFile? Image1 { get; set; }
        public IFormFile? Image2 { get; set; }
    }
}