import React, { useContext } from 'react';
import { UserContext } from '../Context/UserContext';
import NavBar from '../Navigation/NavBar'; // Assuming you're using NavBar

const Order = () => {
  const { user } = useContext(UserContext);
  console.log("User data in Order component:", user);

  return (
    <div>
      <h1>Swopp</h1>
      <p>Welcome, {user.name}!</p>
      <p>ORDER REGISTRATION</p>

      <form>
        <label>Departure Address</label>
        <input type="text" placeholder="Departure Address" required />

        <label>Destination Address</label>
        <input type="text" placeholder="Destination Address" required />

        <label>Date & Time</label>
        <input type="datetime-local" required />

        <button type="submit">Swopp away!</button>
      </form>

      {/* Navigation Bar */}
      <NavBar />
    </div>
  );
};

export default Order;
