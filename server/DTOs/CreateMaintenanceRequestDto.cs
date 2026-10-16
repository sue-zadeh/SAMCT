using System.ComponentModel.DataAnnotations;
using server.Security;
namespace server.DTOs
{
    public class CreateMaintenanceRequestDto
    {
        [Required, StringLength(50)]
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
