import React, { useContext, useState } from "react";
import { UserContext } from "../Context/UserContext";
import { useNavigate } from "react-router-dom";
import NavBar from "../Navigation/NavBar";
import UserOrders from "../customHooks/UserOrders";
import usePfp from "../customHooks/Pfp";
import './UserPage.css'; // Import the new UserPage.css for styling

const UserPage = () => {
    const { user, token } = useContext(UserContext);
    const navigate = useNavigate();
    const { orders, loading, error } = UserOrders();
    const { Pfp, uploading, uploadError } = usePfp();
    const [profilePicture, setProfilePicture] = useState(user?.Pfp);

    const handlePfpChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const profilePictureUrl = await Pfp(file, token);
                setProfilePicture(profilePictureUrl);
            } catch (error) {
                console.error('Error uploading profile picture:', error);
            }
        }
    };

    return (
        <>
            <NavBar />
            <div className="userpage-container">
                <div className="profile-section">
                    <img src={profilePicture || user?.Pfp} alt={user?.name} className="profile-picture" /> 
                    <input type="file" onChange={handlePfpChange} disabled={uploading} />
                    {uploadError && <p className="error-message">{uploadError}</p>}
                    <p className="profile-name">Profile Name: {user?.name}</p>
                    <p className="profile-email">Email: {user?.email}</p>
                </div>
                <div className="orders-section">
                    <div className="orders-header">
                        <h2 className="orders-title">Your Orders</h2>
                        <button 
                            onClick={() => navigate('/order')}
                            className="btn-button">
                            Create New Order
                        </button>
                    </div>
                    <div className="orders-list">
                        {loading && <p>Loading...</p>}
                        {error && <p>Error: {error}</p>}
                        {orders.length === 0 && !loading && <p>No orders found</p>}
                        {orders.map(order => (
                            <div key={order.requestId} className="order">
                                <h3>Order ID: {order.requestId}</h3>
                                <p>Pickup Location: {order.pickupLocation}</p>
                                <p>Dropoff Location: {order.dropoffLocation}</p>
                                <p>Scheduled At: {new Date(order.scheduledAt).toLocaleString()}</p>
                                <p>Description: {order.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserPage;

