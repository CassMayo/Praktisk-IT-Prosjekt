import React, { useState, useContext, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Context/UserContext';
import CreateItem from './CreateItem';
import NavBar from '../Navigation/NavBar'; // Assuming you're using NavBar
import './Order.css'; // Import the new Order.css for styling

const Order = () => {
    const { user, token } = useContext(UserContext);
    //const navigate = useNavigate();
    const [step, setStep] = useState(1); 
    const [createdRequestId, setCreatedRequestId] = useState(null);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [orderData, setOrderData] = useState({
        pickupLocation: '',
        dropoffLocation: '',
        scheduledAt: '',
        description: ''
    });

    // Debug useEffect to monitor state changes
    useEffect(() => {
        console.log('Current step:', step);
        console.log('Created Request ID:', createdRequestId);
    }, [step, createdRequestId]);

    // Debug render
    console.log('Rendering Order component with:', {
        step,
        createdRequestId,
        orderData
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitOrderDetails = async (e) => {
        e.preventDefault();
        console.log('Submit button clicked');

        if (!orderData.pickupLocation || !orderData.dropoffLocation || !orderData.scheduledAt) {
            alert('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        console.log('Creating request...');

        try {
            const requestData = {
                senderEmail: user.email,
                pickupLocation: orderData.pickupLocation,
                dropoffLocation: orderData.dropoffLocation,
                scheduledAt: orderData.scheduledAt,
                description: orderData.description || ''
            };

            console.log('Request data:', requestData);

            const response = await fetch('http://localhost:5078/api/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });

            const responseData = await response.json();
            console.log('Response:', responseData);

            if (response.ok && responseData.requestId) {
                console.log('Request created successfully, setting ID:', responseData.requestId);
                setCreatedRequestId(responseData.requestId);
                console.log('Moving to step 2');
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

    return (
        <>
            <h1 className="order-title">Order Registration</h1>
            <div className="order-container">
                {/* Debug info */}
                <div className="debug-info">
                    <p>Debug Info:</p>
                    <p>Current Step: {step}</p>
                    <p>Request ID: {createdRequestId || 'None'}</p>
                    <p>Is Loading: {isLoading.toString()}</p>
                </div>

                {step === 1 ? (
                    <>
                        <h2 className="title">Step 1: Order Details</h2>
                        <form onSubmit={handleSubmitOrderDetails} className="space-y-4">
                            <div className='form-group'>
                                <label htmlFor='pickupLocation'>Pickup Locaation * </label>
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
                                className={`btn-submit ${isLoading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            >
                                {isLoading ? 'Creating Order...' : 'Create Order & Add Items'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div>
                        <h2 className="title">Step 2: Add Items</h2>
                        {createdRequestId ? (
                            <CreateItem 
                                requestId={createdRequestId}
                                onItemAdded={(item) => {
                                    console.log('New item added:', item);
                                    setItems(prev => [...prev, item]);
                                }}
                            />
                        ) : (
                            <div className="error-msg">
                                Please create an order first.
                                <button 
                                    onClick={() => setStep(1)}
                                    className="ml-2 text-blue-500 underline"
                                >
                                    Go back
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {/* Navigation Bar */}
                <NavBar />
            </div>
        </>
    );
};

export default Order;

