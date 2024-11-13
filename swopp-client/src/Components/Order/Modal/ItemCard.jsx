import React, { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import EditItemModal from './EditItemModal';
import './ItemCard.css';

const ItemCard = ({ item, isDraft, onItemUpdated, onItemDeleted }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    const imageUrl = item?.image
        ? `http://localhost:5078${item.image}`
        : '/api/placeholder/200/150';

    const handleEditClick = () => {
        if (isDraft) {
            setShowEditModal(true);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5078/api/item/${item.itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete item');
            }

            onItemDeleted?.(item.itemId);
        } catch (err) {
            setError(err.message);
            console.error('Error deleting item:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleItemUpdate = (updatedItem) => {
        onItemUpdated?.(updatedItem);
        setShowEditModal(false);
    };

    return (
        <>
            <div className="item-card">
                <div className="item-card-inner">
                    <div className="item-image-container">
                        <img
                            src={imageUrl}
                            alt={item.itemName}
                            className="item-image"
                            onError={(e) => {
                                e.target.src = '/api/placeholder/200/150';
                            }}
                        />
                    </div>
                    <div className="item-info">
                        <div className="item-name">{item.itemName}</div>
                        <div className="item-dimensions">
                            {item.width} × {item.height} × {item.depth} cm
                        </div>
                        <div className="item-weight">
                            {item.weight} KG
                        </div>
                        {item.description && (
                            <div className="item-description" title={item.description}>
                                {item.description}
                            </div>
                        )}
                        {isDraft && (
                            <div className="item-actions">
                                <button 
                                    className="btn btn-edit" 
                                    onClick={handleEditClick}
                                    disabled={isDeleting}
                                >
                                    <Edit className="icon" />
                                    Edit
                                </button>
                                <button 
                                    className="btn btn-delete" 
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="icon" />
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        )}
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showEditModal && (
                <EditItemModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    item={item}
                    onItemUpdated={handleItemUpdate}
                />
            )}
        </>
    );
};

export default ItemCard;