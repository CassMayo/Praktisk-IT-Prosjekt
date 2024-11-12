import React, { useState } from 'react';
import './OrderDetailsCard.css';

const ItemCard = ({ item, onEditItem }) => {
    const imageUrl = item.image 
        ? `http://localhost:5078${item.image}` 
        : '/api/placeholder/200/150';

    return (
        <div className="item-card">
            <div className="item-card-inner">
                <div className="item-image-container">
                    <img
                        src={imageUrl}
                        alt={item.itemName}
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
                    {onEditItem && (
                        <div>
                            <button onClick={() => onEditItem(item)}>
                                Edit
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const OrderDetailsCard = ({
    orderData,
    items,
    onAddItem,
    onSaveDraft,
    onPublish,
    isLoading,
    userOrderCount,
    onEditRequest,
    onEditItem
}) => {
    const [showItems, setShowItems] = useState(true);
    
    // Keep status as Draft if no items, otherwise it's Pending
    const isDraft = !items || items.length === 0;

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
                    <span className="status-badge">
                        {isDraft ? "Draft" : "Pending"}
                    </span>
                    {isDraft && (
                        <button
                            className="btn-edit-request"
                            onClick={onEditRequest}
                        >
                            Edit request
                        </button>
                    )}
                </div>
                <div className="order-actions">
                    {isDraft && (
                        <button
                            className="btn-add-item"
                            onClick={onAddItem}
                        >
                            Add Item
                        </button>
                    )}
                </div>
            </div>

            <div className="items-section">
                {items && items.length > 0 && (
                    <>
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

                        {showItems && (
                            <div className="items-container">
                                <div className="items-grid">
                                    {items.map((item, index) => (
                                        <ItemCard
                                            key={index}
                                            item={item}
                                            onEditItem={isDraft ? onEditItem : undefined}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
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

                {isDraft ? (
                    <button
                        className="btn-swoop"
                        onClick={onSaveDraft}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save as Draft'}
                    </button>
                ) : (
                    <button
                        className="btn-swoop"
                        onClick={onPublish}
                        disabled={isLoading || items.length === 0}
                    >
                        {isLoading ? 'Processing...' : 'Submit Order'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderDetailsCard;