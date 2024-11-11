import React, { useState, useContext } from 'react';
import { UserContext } from '../../Context/UserContext';
import '../Modal/AddItemModal.css';

const ItemType = {
    Electronics: 0,
    Clothing: 1,
    Furniture: 2,
    Books: 3,
    Other: 4
};

const EditItemModal = ({ show, onHide, item, onItemUpdated }) => {
    const { token } = useContext(UserContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    const [itemData, setItemData] = useState({
        itemName: item?.itemName || '',
        itemType: item?.itemType || ItemType.Electronics,
        description: item?.description || '',
        price: item?.price || '',
        width: item?.width || '',
        height: item?.height || '',
        depth: item?.depth || '',
        image: item?.image || ''
    });

    const itemTypes = [
        { value: ItemType.Electronics, label: 'Electronics' },
        { value: ItemType.Clothing, label: 'Clothing' },
        { value: ItemType.Furniture, label: 'Furniture' },
        { value: ItemType.Books, label: 'Books' },
        { value: ItemType.Other, label: 'Other' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`http://localhost:5078/api/item/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...itemData,
                    id: item.id,
                    requestId: item.requestId
                })
            });

            if (response.ok) {
                const updatedItem = await response.json();
                onItemUpdated(updatedItem);
                onHide();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update item');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onHide}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Item</h2>
                    <button className="modal-close" onClick={onHide}>&times;</button>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Item Name *</label>
                        <input
                            type="text"
                            value={itemData.itemName}
                            onChange={(e) => setItemData(prev => ({
                                ...prev,
                                itemName: e.target.value
                            }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Item Type *</label>
                        <select
                            value={itemData.itemType}
                            onChange={(e) => setItemData(prev => ({
                                ...prev,
                                itemType: parseInt(e.target.value)
                            }))}
                            required
                        >
                            {itemTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            value={itemData.description}
                            onChange={(e) => setItemData(prev => ({
                                ...prev,
                                description: e.target.value
                            }))}
                            rows="3"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label>Price * (Kr)</label>
                            <input
                                type="number"
                                value={itemData.price}
                                onChange={(e) => setItemData(prev => ({
                                    ...prev,
                                    price: e.target.value
                                }))}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                        <div className="form-group col-md-6">
                            <label>Image URL</label>
                            <input
                                type="text"
                                value={itemData.image}
                                onChange={(e) => setItemData(prev => ({
                                    ...prev,
                                    image: e.target.value
                                }))}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group col-md-4">
                            <label>Width (cm)</label>
                            <input
                                type="number"
                                value={itemData.width}
                                onChange={(e) => setItemData(prev => ({
                                    ...prev,
                                    width: e.target.value
                                }))}
                                step="0.1"
                                min="0"
                            />
                        </div>
                        <div className="form-group col-md-4">
                            <label>Height (cm)</label>
                            <input
                                type="number"
                                value={itemData.height}
                                onChange={(e) => setItemData(prev => ({
                                    ...prev,
                                    height: e.target.value
                                }))}
                                step="0.1"
                                min="0"
                            />
                        </div>
                        <div className="form-group col-md-4">
                            <label>Depth (cm)</label>
                            <input
                                type="number"
                                value={itemData.depth}
                                onChange={(e) => setItemData(prev => ({
                                    ...prev,
                                    depth: e.target.value
                                }))}
                                step="0.1"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onHide}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditItemModal;