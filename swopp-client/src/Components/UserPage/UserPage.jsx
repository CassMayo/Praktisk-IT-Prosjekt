import React, { useContext } from "react";
import { UserContext } from "../Context/UserContext";
import { useNavigate } from "react-router-dom";
import NavBar from "../Navigation/NavBar";
import './UserPage.css'; // Import the new UserPage.css for styling

const UserPage = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <>
            <NavBar />
            <div className="userpage-container">
                <div className="profile-section">
                    <img src={user?.profilePicture} alt={user?.name} className="profile-picture" />
                    <p className="profile-name"> Profile Name: {user?.name}</p>
                    <p className="profile-email"> Email: {user?.email}</p>
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
                        {/* Render user's orders here */}
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserPage;

