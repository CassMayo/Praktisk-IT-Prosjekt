using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace api.Models
{
    public class Sender
    {
        [Key]
        public int UserId { get; set; }

        public required string Name { get; set; }
        public required string Email { get; set; }

        public required String Password { get; set; }    
    }
}