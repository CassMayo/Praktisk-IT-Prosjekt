// AddItemModal.jsx

import React from 'react';
import CreateItem from './CreateItem';
import './AddItemModal.css';

const AddItemModal = ({ 
    show, 
    onHide, 
    requestId, 
    onItemAdded,
    onStatusChange 
}) => {
    // Don't render modal if 'show' prop is false
    if (!show) return null;

    // Prevent click event from bubbling up and closing the modal when clicking inside the content area
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    // Handle item addition and update the status to "Pending" (status code 1) if needed
    const handleItemAdded = (item) => {
        onItemAdded(item);
        onStatusChange?.(1); // Update status to Pending when item is added
        onHide(); // Close modal after item is added
    };

    return (
        <div className="modal-overlay" onClick={onHide}>
            <div 
                className="modal-content" 
                style={{ maxWidth: '800px' }}
                onClick={handleContentClick}
            >
                <div className="modal-header">
                    <h2>Add Item</h2>
                    <button 
                        className="modal-close"
                        onClick={onHide}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>
                <div className="modal-form">
                    <CreateItem
                        requestId={requestId}
                        onItemAdded={handleItemAdded}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddItemModal;
