namespace server.DTOs
{
    public class UpdateMaintenanceRequestDto
    {
        public string ManagerUserName { get; set; } = "";
        public string ManagerAnswer { get; set; } = "";
        public string Status { get; set; } = "Pending";
    }
}