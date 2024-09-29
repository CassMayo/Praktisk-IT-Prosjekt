using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using api.DAL.Enum;

namespace api.DAL.Models
{
    public class Item
    {
        [Key]
        public int ItemId { get; set; }  // Primary Key

        [ForeignKey("Request")]
        public required int RequestId { get; set; }  // Foreign Key to Request

        public required string ItemName { get; set; }  // Required name of the item
        
        public ItemType ItemType { get; set; } = ItemType.Other;  // Default item type
        
        public required string Description { get; set; }  // Required description of the item
        
        public required float Price { get; set; }  // Required price of the item

        // Navigation property
        public virtual required Request Request { get; set; }  // Navigation property to Request
    }
}
