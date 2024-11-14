import React, { useState, useContext } from 'react';
import { UserContext } from '../../../../Context/UserContext';
//import './EditItemModal.css';

const EditItemModal = ({ show, onHide, item, onItemUpdated, order }) => {
    const { token } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        itemName: item.itemName || '',
        itemType: item.itemType || '',
        description: item.description || '',
        price: item.price || '',
        width: item.width || '',
        height: item.height || '',
        depth: item.depth || '',
        weight: item.weight || '',
        imageFile: null,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('requestId', item.requestId);
            data.append('itemName', formData.itemName);
            data.append('itemType', formData.itemType);
            data.append('description', formData.description);
            data.append('price', parseFloat(formData.price));
            data.append('width', parseFloat(formData.width));
            data.append('height', parseFloat(formData.height));
            data.append('depth', parseFloat(formData.depth));
            data.append('weight', parseFloat(formData.weight));
            if (formData.imageFile) {
                data.append('imageFile', formData.imageFile);
            }

            const response = await fetch(`http://localhost:5078/api/item/${item.itemId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update item');
            }

            const updatedItem = await response.json();
            onItemUpdated(updatedItem);
            onHide();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            imageFile: e.target.files[0],
        }));
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onHide}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Item</h2>
                    <button className="modal-close" onClick={onHide}>&times;</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="edit-item-form">
                    <div className="form-group">
                        <label htmlFor="itemName">Item Name *</label>
                        <input
                            id="itemName"
                            name="itemName"
                            type="text"
                            value={formData.itemName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="itemType">Item Type *</label>
                        <select
                            id="itemType"
                            name="itemType"
                            value={formData.itemType}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Item Type</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Books">Books</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="price">Price ($) *</label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="dimensions-group">
                            <label>Dimensions (cm) *</label>
                            <div className="dimensions-inputs">
                                <input
                                    name="width"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={formData.width}
                                    onChange={handleInputChange}
                                    placeholder="Width"
                                    required
                                />
                                <input
                                    name="height"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={formData.height}
                                    onChange={handleInputChange}
                                    placeholder="Height"
                                    required
                                />
                                <input
                                    name="depth"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={formData.depth}
                                    onChange={handleInputChange}
                                    placeholder="Depth"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="weight">Weight (kg) *</label>
                        <input
                            id="weight"
                            name="weight"
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.weight}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">New Image (Optional)</label>
                        <input
                            id="image"
                            name="imageFile"
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onHide}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditItemModal;