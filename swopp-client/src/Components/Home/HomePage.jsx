import React from 'react';
import NavBar from '../Navigation/NavBar';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to Swopp!</h1>
      <p>Register your order below:</p>

      {/* Your order module form goes here */}
      <div>
        <label>Departure Address:</label>
        <input type="text" placeholder="Departure Address" required />

        <label>Destination Address:</label>
        <input type="text" placeholder="Destination Address" required />

        <label>Date & Time:</label>
        <input type="datetime-local" required />

        <button type="submit">Swopp away!</button>
      </div>

      {/* Include Bottom Navigation Bar */}
      <NavBar />
    </div>
  );
};

export default HomePage;
