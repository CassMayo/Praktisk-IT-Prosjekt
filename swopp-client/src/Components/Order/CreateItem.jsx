import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';

const ItemType = {
    Electronics: 0,
    Clothing: 1,
    Furniture: 2,
    Books: 3,
    Other: 4
};

const CreateItem = ({ requestId, onItemAdded }) => {
    const { token } = useContext(UserContext);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    const [itemData, setItemData] = useState({
        requestId: requestId,
        itemName: '',
        itemType: ItemType.Electronics,
        description: '',
        price: '',
        width: '',
        height: '',
        depth: '',
        image: ''
    });

    const [validation, setValidation] = useState({
        itemName: true,
        description: true,
        price: true
    });

    const itemTypes = [
        { value: ItemType.Electronics, label: 'Electronics' },
        { value: ItemType.Clothing, label: 'Clothing' },
        { value: ItemType.Furniture, label: 'Furniture' },
        { value: ItemType.Books, label: 'Books' },
        { value: ItemType.Other, label: 'Other' }
    ];

    useEffect(() => {
        if (!token) {
            navigate('/login', { state: { from: window.location.pathname } });
        }
    }, [token, navigate]);

    useEffect(() => {
        setItemData(prev => ({
            ...prev,
            requestId: requestId
        }));
    }, [requestId]);

    const validateForm = () => {
        const newValidation = {
            itemName: itemData.itemName.trim().length > 0,
            description: itemData.description.trim().length > 0,
            price: itemData.price > 0
        };
        setValidation(newValidation);
        return Object.values(newValidation).every(Boolean);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setError(null);
        setValidation(prev => ({
            ...prev,
            [name]: true
        }));

        setItemData(prev => ({
            ...prev,
            [name]: ['price', 'width', 'height', 'depth'].includes(name) 
                ? (value === '' ? '' : parseFloat(value))
                : name === 'itemType' 
                    ? parseInt(value)
                    : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            setError('Please fill in all required fields correctly.');
            return;
        }

        if (!token) {
            setError('Please log in to continue');
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                ...itemData,
                requestId: parseInt(requestId),
                price: parseFloat(itemData.price),
                width: itemData.width ? parseFloat(itemData.width) : null,
                height: itemData.height ? parseFloat(itemData.height) : null,
                depth: itemData.depth ? parseFloat(itemData.depth) : null
            };

            const response = await fetch('http://localhost:5078/api/item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();
            
            if (response.ok) {
                onItemAdded(responseData);
                setItemData({
                    requestId: requestId,
                    itemName: '',
                    itemType: ItemType.Electronics,
                    description: '',
                    price: '',
                    width: '',
                    height: '',
                    depth: '',
                    image: ''
                });
            } else {
                if (response.status === 401) {
                    setError('Your session has expired. Please log in again.');
                    navigate('/login', { state: { from: window.location.pathname } });
                } else {
                    setError(responseData.message || 'Failed to create item');
                }
            }
        } catch (error) {
            console.error('Error creating item:', error);
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!requestId) {
        return <div className="alert alert-danger">Error: No request ID available</div>;
    }

    return (
        <div>
            <h3 className="mb-4">Add New Item</h3>
            
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Item Name *</label>
                    <input
                        type="text"
                        name="itemName"
                        value={itemData.itemName}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                    {!validation.itemName && (
                        <small className="text-danger">Item name is required</small>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Item Type *</label>
                    <select
                        name="itemType"
                        value={itemData.itemType}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                    >
                        {itemTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                        name="description"
                        value={itemData.description}
                        onChange={handleInputChange}
                        className="form-control"
                        rows="3"
                        required
                    />
                    {!validation.description && (
                        <small className="text-danger">Description is required</small>
                    )}
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Price * (Kr)</label>
                        <input
                            type="number"
                            name="price"
                            value={itemData.price}
                            onChange={handleInputChange}
                            className="form-control"
                            step="0.01"
                            min="0"
                            required
                        />
                        {!validation.price && (
                            <small className="text-danger">Valid price is required</small>
                        )}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Image URL</label>
                        <input
                            type="text"
                            name="image"
                            value={itemData.image}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter image URL"
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Width (cm)</label>
                        <input
                            type="number"
                            name="width"
                            value={itemData.width}
                            onChange={handleInputChange}
                            className="form-control"
                            step="0.1"
                            min="0"
                        />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Height (cm)</label>
                        <input
                            type="number"
                            name="height"
                            value={itemData.height}
                            onChange={handleInputChange}
                            className="form-control"
                            step="0.1"
                            min="0"
                        />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Depth (cm)</label>
                        <input
                            type="number"
                            name="depth"
                            value={itemData.depth}
                            onChange={handleInputChange}
                            className="form-control"
                            step="0.1"
                            min="0"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-100"
                >
                    {isSubmitting ? 'Adding Item...' : 'Add Item'}
                </button>
            </form>
        </div>
    );
};

export default CreateItem;
