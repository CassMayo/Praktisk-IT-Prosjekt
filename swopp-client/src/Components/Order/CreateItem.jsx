import React, { useState, useContext } from 'react';
import { UserContext } from '../Context/UserContext';

const CreateItem = ({ requestId, onItemAdded }) => {
    const { token } = useContext(UserContext);
    const [itemData, setItemData] = useState({
        requestId: requestId, 
        itemName: '',
        itemType: 'Electronics',
        description: '',
        price: ''
    });

    console.log('Current requestId:', requestId); // Debug log

    const itemTypes = ['Electronics', 'Clothing', 'Furniture', 'Books', 'Other'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setItemData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) || '' : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Ensure requestId is included in the payload
        const payload = {
            ...itemData,
            requestId: requestId // Explicitly set requestId
        };

        console.log('Sending payload:', payload); // Debug log

        try {
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
                // Reset form
                setItemData({
                    requestId: requestId, // Keep the requestId
                    itemName: '',
                    itemType: 'Electronics',
                    description: '',
                    price: ''
                });
            } else {
                console.error('Error response:', responseData);
                alert(responseData.message || 'Failed to create item');
            }
        } catch (error) {
            console.error('Error creating item:', error);
            alert('Error creating item. Please try again.');
        }
    };

    // Add effect to update itemData when requestId changes
    React.useEffect(() => {
        setItemData(prev => ({
            ...prev,
            requestId: requestId
        }));
    }, [requestId]);

    return (
        <div className="mt-4 p-4 border rounded shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
            {requestId ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Item Name
                        </label>
                        <input
                            type="text"
                            name="itemName"
                            value={itemData.itemName}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Item Type
                        </label>
                        <select
                            name="itemType"
                            value={itemData.itemType}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
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
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={itemData.description}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            rows="3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Price
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={itemData.price}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Add Item
                    </button>
                </form>
            ) : (
                <p className="text-red-500">Error: No request ID available</p>
            )}
        </div>
    );
};

export default CreateItem;