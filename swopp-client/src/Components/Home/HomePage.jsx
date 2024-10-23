import React from 'react';
import NavBar from '../Navigation/NavBar';
import Order from '../Order/Order';

const HomePage = () => {
    return (
      <div>
        <h1>Welcome to Swopp!</h1>
        <Order /> {/* Render Order component inside HomePage */}
        <NavBar /> {/* Include Navigation Bar */}
      </div>
    );
  };

export default HomePage;
