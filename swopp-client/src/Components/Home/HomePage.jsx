import React from 'react';
import NavBar from '../Navigation/NavBar';
import Order from '../Order/Order';
import SwoppLogo from '../../Assets/White_Swopp.png'; // Swopp logo
import './HomePage.css';

const HomePage = () => {
    return (
        <div className='homepage-container'>
            <NavBar /> {/* Include Navigation Bar */}
                    <img src={SwoppLogo} className="swopp-logo" />
                <div className="order-container">
                    <Order /> {/* Render Order component inside HomePage */}
                </div>
            </div>

    );
};

export default HomePage;
