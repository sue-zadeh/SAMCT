namespace server.DTOs
{
    public class UpdatePasswordRequestDto
    {
        public string UserName { get; set; } = "";
        public string CurrentPassword { get; set; } = "";
        public string NewPassword { get; set; } = "";
    }
}