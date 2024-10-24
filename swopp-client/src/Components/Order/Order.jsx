import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Context/UserContext';
import NavBar from '../Navigation/NavBar';
import './Order.css';

const Order = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [departureAddress, setDepartureAddress] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');
    const [dateTime, setDateTime] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare the initial data
        const initialData = {
            senderEmail: user?.email,
            pickupLocation: departureAddress,
            dropoffLocation: destinationAddress,
            scheduledAt: dateTime
        };

        console.log('Initial Request Data:', initialData);

        // Navigate to the product details component and pass the initialData as state
        navigate('/product-details', { state: initialData });
    };

    return (
        <div className="order">
            <div>
                <h1>Welcome, {user?.name}!</h1>
                <h1>ORDER REGISTRATION</h1>

                <div className="order-input">
                    <form onSubmit={handleSubmit}>
                        <label>Departure Address</label>
                        <input 
                            type="text" 
                            placeholder="Departure Address" 
                            value={departureAddress}
                            onChange={(e) => setDepartureAddress(e.target.value)}
                            required 
                        />

                        <label>Destination Address</label>
                        <input 
                            type="text" 
                            placeholder="Destination Address" 
                            value={destinationAddress}
                            onChange={(e) => setDestinationAddress(e.target.value)}
                            required 
                        />

                        <label>Date & Time</label>
                        <input 
                            type="datetime-local" 
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            required 
                        />

                        <button type="submit">Swopp away!</button>
                    </form>
                </div>
            </div>

            <NavBar />
        </div>
    );
};

export default Order;
