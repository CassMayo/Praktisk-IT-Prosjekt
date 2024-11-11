import React, { useState } from 'react';
import './OrderDetailsCard.css';

const ItemCard = ({ item, onEditItem }) => (
    <div className="item-card">
        <div className="item-card-inner">
            <div className="item-image-container">
                <div className="item-actions">
                    <button 
                        className="btn-edit-item"
                        onClick={() => onEditItem(item)}
                    >
                        Edit
                    </button>
                </div>
                <img 
                    src={item.imageUrl || "/api/placeholder/200/150"} 
                    alt={item.name} 
                    className="item-image"
                />
            </div>
            <div className="item-info">
                <div className="item-dimensions">
                    {item.width || "50"} x {item.height || "50"} x {item.depth || "50"} cm
                </div>
                <div className="item-weight">
                    {item.weight || "70"} KG
                </div>
            </div>
        </div>
    </div>
);

const OrderDetailsCard = ({ 
    orderData, 
    items, 
    onAddItem, 
    onSwoopAway, 
    isLoading, 
    userOrderCount,
    onEditRequest, // Prop for opening the edit request modal
    onEditItem 
}) => {
    const [showItems, setShowItems] = useState(true);

    // Format dates for display (day and month)
    const formatDate = (date) => {
        return date ? new Date(date).toLocaleString('en-SE', {
            day: 'numeric',
            month: 'short',
        }) : 'Anytime';
    };

    return (
        <div className="order-card">
            <div className="order-card-header">
                <div className="order-info">
                    <h3 className="order-number">Your Order #{userOrderCount}</h3>
                    <span className="status-badge">Draft</span>
                    <button 
                        className="btn-edit-request"
                        onClick={onEditRequest} // Call onEditRequest here to open the modal
                    >
                        Edit request
                    </button>
                </div>
                <div className="order-actions">
                    <button className="btn-add-item" onClick={onAddItem}>
                        Add Item
                    </button>
                </div>
            </div>

            <div className="items-section">
                <div className="items-header">
                    <div className="packages-count">
                        <div className="packages-icon">📦</div>
                        <span>{items.length} packages</span>
                    </div>
                    <button 
                        className="btn-toggle"
                        onClick={() => setShowItems(!showItems)}
                    >
                        {showItems ? 'Hide Items' : 'Show Items'}
                    </button>
                </div>

                {showItems && items.length > 0 && (
                    <div className="items-container">
                        <div className="items-grid">
                            {items.map((item, index) => (
                                <ItemCard 
                                    key={index} 
                                    item={item}
                                    onEditItem={onEditItem}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="location-details">
                <div className="location-point">
                    <div className="point"></div>
                    <span>{orderData.pickupLocation}</span>
                </div>
                <div className="connection-line"></div>
                <div className="location-point">
                    <div className="point"></div>
                    <span>{orderData.dropoffLocation}</span>
                </div>
            </div>

            <div className="order-info-grid">
                <div className="info-item">
                    <label>Scheduled Dates</label>
                    <span>
                        {formatDate(orderData.scheduledAt)} - {formatDate(orderData.alternateDate)}
                    </span>
                </div>

                {orderData.description && (
                    <div className="info-item">
                        <label>Description</label>
                        <span>{orderData.description}</span>
                    </div>
                )}

                <button 
                    className="btn-swoop"
                    onClick={onSwoopAway}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : items.length > 0 ? 'Publish' : 'Save Draft'}
                </button>
            </div>
        </div>
    );
};

export default OrderDetailsCard;
