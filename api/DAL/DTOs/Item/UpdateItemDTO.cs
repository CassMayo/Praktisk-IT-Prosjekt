using api.DAL.Enum;

namespace api.DAL.DTOs.Item
{
    public class UpdateItemDTO
    {
        public required string ItemName { get; set; }
        public required ItemType ItemType { get; set; }
        public required string Description { get; set; }
        public required float Price { get; set; }
        public IFormFile? ImageFile { get; set; }
        public required float Width { get; set; }
        public required float Height { get; set; }  
        public required float Depth { get; set; }

        public required float Weight { get; set; }
    }
}