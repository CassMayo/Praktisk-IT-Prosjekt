import React, { useState } from 'react';
import './OrderDetailsCard.css';

const ItemCard = ({ item, description }) => (
    <div className="item-card">
        <img 
            src={item.imageUrl || "/api/placeholder/200/150"} 
            alt={item.name} 
            className="item-image"
        />
        <div className="item-dimensions">
            {item.dimensions || "99 × 120 × 82 cm"}
        </div>
        <div className="item-weight">
            {item.weight || "70"} KG
        </div>
        <div className="item-description">
            {description || "No description provided"}
        </div>
    </div>
);

const OrderDetailsCard = ({ orderData, items, onAddItem, onSwoopAway, isLoading, userOrderCount }) => {
    const [showItems, setShowItems] = useState(true);

    return (
        <div className="order-card">
            <div className="order-card-header">
                <div className="order-info">
                    <h3 className="order-number">Your Order #{userOrderCount}</h3>
                    <span className="status-badge">Draft</span>
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
                    <div className="items-grid">
                        {items.map((item, index) => (
                            <ItemCard key={index} item={item} description={orderData.description} />
                        ))}
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
                    <label>Scheduled Date</label>
                    <span>
                        {new Date(orderData.scheduledAt).toLocaleString('en-SE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
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
                        disabled={isLoading || items.length === 0}
                    >
                        {isLoading ? 'Processing...' : 'Publish'}
                    </button>
            </div>
        </div>
    );
};

export default OrderDetailsCard;
