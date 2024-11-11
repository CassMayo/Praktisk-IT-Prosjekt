import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import CreateItem from './CreateItem';
import NavBar from '../Navigation/NavBar';
import './Order.css';

const RequestStatus = {
    Draft: 0,
    Pending: 1,
    Accepted: 2,
    Completed: 3,
    Cancelled: 4,
    Lost: 5
};

const Order = () => {
    const { user, token } = useContext(UserContext);
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [createdRequestId, setCreatedRequestId] = useState(null);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);
    const [expandedItems, setExpandedItems] = useState(false);
    const [orderData, setOrderData] = useState({
        pickupLocation: '',
        dropoffLocation: '',
        scheduledAt: '',
        description: '',
        status: RequestStatus.Draft
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const fetchItems = async (requestId) => {
        try {
            const response = await fetch(`http://localhost:5078/api/item/request/${requestId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleSubmitOrderDetails = async (e) => {
        e.preventDefault();

        if (!orderData.pickupLocation || !orderData.dropoffLocation || !orderData.scheduledAt) {
            alert('Please fill in all required fields');
            return;
        }

        setIsLoading(true);

        try {
            const requestData = {
                senderEmail: user.email,
                pickupLocation: orderData.pickupLocation,
                dropoffLocation: orderData.dropoffLocation,
                scheduledAt: orderData.scheduledAt,
                description: orderData.description || '',
                status: RequestStatus.Draft
            };

            const response = await fetch('http://localhost:5078/api/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });

            const responseData = await response.json();

            if (response.ok && responseData.requestId) {
                setCreatedRequestId(responseData.requestId);
                setStep(2);
            } else {
                throw new Error(responseData.message || 'Failed to create request');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwoopAway = async () => {
        if (items.length === 0) {
            alert('Please add at least one item before submitting the order');
            return;
        }

        if (!window.confirm('Are you sure you want to submit this order? You won\'t be able to edit it after submission.')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5078/api/request/${createdRequestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...orderData,
                    status: RequestStatus.Pending
                })
            });

            if (response.ok) {
                alert('Order submitted successfully!');
                navigate('/user'); // Redirect to orders list
            } else {
                throw new Error('Failed to submit order');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (createdRequestId) {
            fetchItems(createdRequestId);
        }
    }, [createdRequestId]);

    const renderOrderCard = () => {
        if (!createdRequestId) return null;

        return (
            <div className="order-card bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="order-header flex justify-between items-center mb-4">
                    <div className="order-title">
                        <h3 className="text-xl font-semibold">Order #{createdRequestId}</h3>
                        <span className="status-badge bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                            Draft
                        </span>
                    </div>
                    <div className="order-actions space-x-2">
                        <button
                            onClick={() => setShowAddItem(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Add Item
                        </button>
                        <button
                            onClick={handleSwoopAway}
                            disabled={isLoading || items.length === 0}
                            className={`px-4 py-2 rounded text-white
                                ${isLoading || items.length === 0 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-500 hover:bg-green-600'}`}
                        >
                            Swoop Away
                        </button>
                    </div>
                </div>

                <div className="order-details space-y-4">
                    <div className="location-details grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Pickup Location
                            </label>
                            <input
                                type="text"
                                name="pickupLocation"
                                value={orderData.pickupLocation}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Dropoff Location
                            </label>
                            <input
                                type="text"
                                name="dropoffLocation"
                                value={orderData.dropoffLocation}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Scheduled Date
                            </label>
                            <input
                                type="datetime-local"
                                name="scheduledAt"
                                value={orderData.scheduledAt}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={orderData.description}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                rows="1"
                            />
                        </div>
                    </div>

                    {items.length > 0 && (
                        <div className="items-section">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-lg font-semibold">Items ({items.length})</h4>
                                <button 
                                    onClick={() => setExpandedItems(!expandedItems)}
                                    className="text-blue-500 hover:text-blue-600"
                                >
                                    {expandedItems ? 'Hide Items' : 'Show Items'}
                                </button>
                            </div>
                            
                            {expandedItems && (
                                <div className="grid grid-cols-1 gap-4">
                                    {items.map((item) => (
                                        <div key={item.itemId} className="item-card bg-gray-50 p-4 rounded border">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-medium">{item.itemName}</h5>
                                                    <p className="text-sm text-gray-600">{item.description}</p>
                                                    <p className="text-sm">Price: Kr {item.price}</p>
                                                    {(item.width || item.height || item.depth) && (
                                                        <p className="text-sm text-gray-500">
                                                            Dimensions: 
                                                            {item.width && ` W:${item.width}cm`}
                                                            {item.height && ` H:${item.height}cm`}
                                                            {item.depth && ` D:${item.depth}cm`}
                                                        </p>
                                                    )}
                                                </div>
                                                {item.image && (
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.itemName}
                                                        className="w-20 h-20 object-cover rounded"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <NavBar />
            <div className="main-container max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Order Registration</h1>
                
                {step === 1 ? (
                    <form onSubmit={handleSubmitOrderDetails} className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Create New Order</h2>
                        <div className="space-y-4">
                            <div className="form-group">
                                <label htmlFor="pickupLocation">Pickup Location *</label>
                                <input
                                    type="text"
                                    id="pickupLocation"
                                    name="pickupLocation"
                                    value={orderData.pickupLocation}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="dropoffLocation">Dropoff Location *</label>
                                <input
                                    type="text"
                                    id="dropoffLocation"
                                    name="dropoffLocation"
                                    value={orderData.dropoffLocation}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="scheduledAt">Scheduled Date *</label>
                                <input
                                    type="datetime-local"
                                    id="scheduledAt"
                                    name="scheduledAt"
                                    value={orderData.scheduledAt}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="description">Description (Optional)</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={orderData.description}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    rows="3"
                                />
                            </div>
                            
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-2 text-white font-bold rounded
                                    ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                            >
                                {isLoading ? 'Creating Order...' : 'Create Order'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {renderOrderCard()}
                        {showAddItem && (
                            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Add New Item</h2>
                                    <button 
                                        onClick={() => setShowAddItem(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        Close
                                    </button>
                                </div>
                                <CreateItem 
                                    requestId={createdRequestId}
                                    onItemAdded={(item) => {
                                        setItems(prev => [...prev, item]);
                                        setShowAddItem(false);
                                    }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default Order;