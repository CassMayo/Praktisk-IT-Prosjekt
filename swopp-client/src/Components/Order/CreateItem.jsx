import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';

const CreateItem = ({ requestId, onItemAdded }) => {
    const { token, user } = useContext(UserContext);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    const [itemData, setItemData] = useState({
        requestId: requestId,
        itemName: '',
        itemType: 'Electronics',
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

    const itemTypes = ['Electronics', 'Clothing', 'Furniture', 'Books', 'Other'];

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
                    itemType: 'Electronics',
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
        return <div className="p-4 text-red-500 bg-red-50 rounded">Error: No request ID available</div>;
    }

    return (
        <div className="mt-4 p-4 border rounded shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 rounded border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Item Name *
                    </label>
                    <input
                        type="text"
                        name="itemName"
                        value={itemData.itemName}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 
                            ${!validation.itemName ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {!validation.itemName && (
                        <p className="mt-1 text-sm text-red-500">Item name is required</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Item Type *
                    </label>
                    <select
                        name="itemType"
                        value={itemData.itemType}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                        required
                    >
                        {itemTypes.map(type => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={itemData.description}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-200
                            ${!validation.description ? 'border-red-500' : 'border-gray-300'}`}
                        rows="3"
                        required
                    />
                    {!validation.description && (
                        <p className="mt-1 text-sm text-red-500">Description is required</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Price * (Kr)
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={itemData.price}
                            onChange={handleInputChange}
                            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-200
                                ${!validation.price ? 'border-red-500' : 'border-gray-300'}`}
                            step="0.01"
                            min="0"
                            required
                        />
                        {!validation.price && (
                            <p className="mt-1 text-sm text-red-500">Valid price is required</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Image URL
                        </label>
                        <input
                            type="text"
                            name="image"
                            value={itemData.image}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                            placeholder="Enter image URL"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Width (cm)
                        </label>
                        <input
                            type="number"
                            name="width"
                            value={itemData.width}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                            step="0.1"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Height (cm)
                        </label>
                        <input
                            type="number"
                            name="height"
                            value={itemData.height}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                            step="0.1"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Depth (cm)
                        </label>
                        <input
                            type="number"
                            name="depth"
                            value={itemData.depth}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                            step="0.1"
                            min="0"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2 px-4 rounded font-bold
                        ${isSubmitting 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                    {isSubmitting ? 'Adding Item...' : 'Add Item'}
                </button>
            </form>
        </div>
    );
};

export default CreateItem;