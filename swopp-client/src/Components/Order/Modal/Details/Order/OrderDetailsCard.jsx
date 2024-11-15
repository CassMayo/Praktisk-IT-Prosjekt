import React, { useState, useEffect } from 'react';
import './OrderDetailsCard.css';
import ItemCard from '../Item/ItemCard';
import { RequestStatus } from '../../../Constants/RequestStatus';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const OrderDetailsCard = ({
    orderData,
    items: initialItems,
    onAddItem,
    onSaveDraft,
    onPublish,
    isLoading,
    userOrderCount,
    onEditRequest,
    onItemUpdate,
    onItemDelete,
    status = RequestStatus.Draft
}) => {
    const [showItems, setShowItems] = useState(true);
    const [items, setItems] = useState(initialItems);
    const isDraft = status === RequestStatus.Draft;

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const handlePublish = () => {
        if (!items || items.length === 0) {
            alert('Please add at least one item before publishing');
            return;
        }
        onPublish();
    };

    const handleAddItem = () => {
        if (isDraft) {
            onAddItem();
        } else {
            alert("Items can only be added when the order is in Draft status");
        }
    };

    const handleItemDelete = (itemId) => {
        setItems(currentItems => currentItems.filter(item => item.itemId !== itemId));
        onItemDelete?.(itemId);
    };

    const handleItemUpdate = (updatedItem) => {
        setItems(currentItems => 
            currentItems.map(item => 
                item.itemId === updatedItem.itemId ? updatedItem : item
            )
        );
        onItemUpdate?.(updatedItem);
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
                            onClick={handleAddItem}
                        >
                            Add Item
                        </button>
                    )}
                </div>
            </div>

            {items && items.length > 0 && (
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

                    {showItems && (
                        <div className="items-container">
                            <div className="items-grid">
                                {items.map((item) => (
                                    <ItemCard
                                        key={item.itemId}
                                        item={item}
                                        isDraft={isDraft}
                                        onItemUpdated={handleItemUpdate}
                                        onItemDeleted={handleItemDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

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

                {isDraft && (
                    <div className="button-container">
                        <button
                            className="btn-swoop btn-draft"
                            onClick={onSaveDraft}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save as Draft'}
                        </button>
                        <button
                            className="btn-swoop btn-publish"
                            onClick={handlePublish}
                            disabled={isLoading || !items || items.length === 0}
                            title={!items || items.length === 0 ? 'Add at least one item to publish' : ''}
                        >
                            {isLoading ? 'Processing...' : 'Publish Order'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailsCard;