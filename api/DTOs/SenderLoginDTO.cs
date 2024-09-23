using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{
public class SenderLoginDTO
{
    [Required]
    public required string Email { get; set; }


    [Required]
    public required string Password { get; set; }
}
}