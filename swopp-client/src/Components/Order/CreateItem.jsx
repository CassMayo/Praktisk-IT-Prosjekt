import React, { useState, useContext } from 'react';
import { UserContext } from '../Context/UserContext';
import './CreateItem.css';

const CreateItem = ({ requestId, onItemAdded }) => {
    const { token } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        itemName: '',
        itemType: '',
        description: '',
        price: '',
        width: '',
        height: '',
        depth: '',
        weight: '',
        imageFile: null,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('requestId', requestId);
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

            const response = await fetch('http://localhost:5078/api/item', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create item');
            }

            const newItem = await response.json();
            onItemAdded(newItem);
            setFormData({
                itemName: '',
                itemType: '',
                description: '',
                price: '',
                width: '',
                height: '',
                depth: '',
                imageFile: null,
            });
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

    return (
        <form onSubmit={handleSubmit} className="create-item-form">
            {error && <div className="error-message">{error}</div>}

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
                    placeholder="Weight"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="image">Image</label>
                <input
                    id="image"
                    name="imageFile"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                />
            </div>

            <div className="form-actions">
                <button
                    type="submit"
                    className="btn-submit"
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add Item'}
                </button>
            </div>
        </form>
    );
};

export default CreateItem;
