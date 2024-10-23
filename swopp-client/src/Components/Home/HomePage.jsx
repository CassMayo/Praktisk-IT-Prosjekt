import React from 'react';
import NavBar from '../Navigation/NavBar';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to Swopp!</h1>
      <p>Register your order below:</p>


      {/* Include Navigation Bar */}
      <NavBar />
    </div>
  );
};

export default HomePage;
