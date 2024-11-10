using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using api.DAL.Enum;

namespace api.DAL.Models
{
    public class Item
    {
        [Key]
        public int ItemId { get; set; }  // Primary Key

        [ForeignKey("Request")] // Foreign Key to Request
        public required int RequestId { get; set; }  // Foreign Key to Request

        public required string ItemName { get; set; }  // Required name of the item
        
        public required ItemType ItemType { get; set; }
        
        public required string Description { get; set; }  // Required description of the item
        
        public required float Price { get; set; }  // Required price of the item

        public required string Image { get; set; }  // New property for item image URL
        public required float Width { get; set; }   // New property for item width
        public required float Height { get; set; }  // New property for item height
        public required float Depth { get; set; }   // New property for item depth

        // Navigation property
        public virtual required Request Request { get; set; }  // Navigation property to Request
    }
}
