import React from 'react';
import NavBar from '../Navigation/NavBar';
import Order from '../Order/Order';

const HomePage = () => {
    return (
      <div>
        <NavBar /> {/* Include Navigation Bar */}
        <Order /> {/* Render Order component inside HomePage */}
      </div>
    );
  };

export default HomePage;
