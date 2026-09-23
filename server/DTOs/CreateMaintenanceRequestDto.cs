using System.ComponentModel.DataAnnotations;
using server.Security;
namespace server.DTOs
{
    public class CreateMaintenanceRequestDto
    {
        [Required, StringLength(50, MinimumLength = 3), RegularExpression(@"[A-Za-z0-9_.-]+")]
        public string UserName { get; set; } = "";
        [Required, StringLength(60)]
        public string Village { get; set; } = "";
        [Required, StringLength(160)]
        public string Title { get; set; } = "";
        [Required, StringLength(2000)]
        public string Description { get; set; } = "";
        [Required, StringLength(250)]
        public string UnitOrAddress { get; set; } = "";
        [Required, RegularExpression("Low|Normal|High|Urgent")]
        public string Priority { get; set; } = "Normal";
        public IFormFile? Image1 { get; set; }
        public IFormFile? Image2 { get; set; }
    }
}