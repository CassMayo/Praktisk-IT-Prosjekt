using System.ComponentModel.DataAnnotations;

namespace api.DAL.DTOs.User
{
    public class UserUpdateDTO
    {
        [Required]
        public string Name { get; set; }
    }
}