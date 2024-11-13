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

const EditItemModal = ({ show, onHide, item, onItemUpdated, order }) => {
    const { token } = useContext(UserContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(item?.image || null);
    
    const [itemData, setItemData] = useState({
        itemName: item?.itemName || '',
        itemType: item?.itemType || ItemType.Electronics,
        description: item?.description || '',
        price: item?.price || '',
        width: item?.width || '',
        height: item?.height || '',
        depth: item?.depth || '',
        weight: item?.weight || ''
    });

    // Check if edit is allowed
    if (order?.status !== 0) {
        return (
            <div className="modal-overlay" onClick={onHide}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Cannot Edit Item</h2>
                        <button className="modal-close" onClick={onHide}>&times;</button>
                    </div>
                    <div className="modal-body">
                        <p>Items can only be edited when the order is in Draft status.</p>
                    </div>
                    <div className="modal-actions">
                        <button className="btn-cancel" onClick={onHide}>Close</button>
                    </div>
                </div>
            </div>
        );
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            
            // Append all item data
            Object.keys(itemData).forEach(key => {
                if (itemData[key] !== null && itemData[key] !== '') {
                    formData.append(key, itemData[key]);
                }
            });
            
            // Append image file if selected
            if (imageFile) {
                formData.append('imageFile', imageFile);
            }

            // Add required IDs
            formData.append('id', item.id);
            formData.append('requestId', item.requestId);

            const response = await fetch(`http://localhost:5078/api/item/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
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
                    {/* Existing form fields... */}
                    
                    {/* Replace image URL input with file upload */}
                    <div className="form-group">
                        <label>Item Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="image-input"
                        />
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Preview" />
                            </div>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group col-md-4">
                            <label>Width (cm) *</label>
                            <input
                                type="number"
                                value={itemData.width}
                                onChange={(e) => setItemData(prev => ({
                                    ...prev,
                                    width: e.target.value
                                }))}
                                step="0.1"
                                min="0"
                                required
                            />
                        </div>
                        <div className="form-group col-md-4">
                            <label>Height (cm) *</label>
                            <input
                                type="number"
                                value={itemData.height}
                                onChange={(e) => setItemData(prev => ({
                                    ...prev,
                                    height: e.target.value
                                }))}
                                step="0.1"
                                min="0"
                                required
                            />
                        </div>
                        <div className="form-group col-md-4">
                            <label>Depth (cm) *</label>
                            <input
                                type="number"
                                value={itemData.depth}
                                onChange={(e) => setItemData(prev => ({
                                    ...prev,
                                    depth: e.target.value
                                }))}
                                step="0.1"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Weight (kg) *</label>
                        <input
                            type="number"
                            value={itemData.weight}
                            onChange={(e) => setItemData(prev => ({
                                ...prev,
                                weight: e.target.value
                            }))}
                            step="0.1"
                            min="0"
                            required
                        />
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