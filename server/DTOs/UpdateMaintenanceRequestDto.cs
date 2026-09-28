using System.ComponentModel.DataAnnotations;
using server.Security;
namespace server.DTOs
{
    public class UpdateMaintenanceRequestDto
    {
        [StringLength(50)]
        public string ManagerUserName { get; set; } = "";
        [StringLength(2000)]
        public string ManagerAnswer { get; set; } = "";
        [Required, RegularExpression("Pending|In Progress|Completed")]
        public string Status { get; set; } = "Pending";
    }
}