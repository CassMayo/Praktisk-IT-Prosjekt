using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace api.Models
{
    public class Sender
    {
        public required string Name { get; set; }
        
        [Key]
        public required string Email { get; set; }

        public required String Password { get; set; }    
    }
}