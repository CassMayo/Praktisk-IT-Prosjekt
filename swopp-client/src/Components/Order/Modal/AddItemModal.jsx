import React from 'react';
import CreateItem from '../CreateItem';
import './AddItemModal.css';

const AddItemModal = ({ show, onHide, requestId, onItemAdded }) => {
    if (!show) return null;

    const handleContentClick = (e) => {
        // Prevent clicks inside the modal from closing it
        e.stopPropagation();
    };

    return (
        <div className="modal-overlay" onClick={onHide}>
            <div 
                className="modal-content" 
                style={{ maxWidth: '800px' }}
                onClick={handleContentClick}
            >
                <div className="modal-header">
                    <button
                        className="modal-close"
                        onClick={onHide}
                    >
                        &times;
                    </button>
                </div>
                <div className="modal-form">
                    <CreateItem
                        requestId={requestId}
                        onItemAdded={(item) => {
                            onItemAdded(item);
                            onHide();
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddItemModal;