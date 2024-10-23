import React, { useContext } from 'react';
import { UserContext } from '../Context/UserContext';
import NavBar from '../Navigation/NavBar'; // Assuming you're using NavBar
import './Order.css'; // Import the new Order.css for styling

const Order = () => {
    const { user } = useContext(UserContext);
    console.log("User data in Order component:", user);
  
    return (
      <div className="order">  {/* Similar to 'login' class */}
        <div> 
          <h1>Welcome, {user?.name}!</h1>
          <h1>ORDER REGISTRATION</h1>
  
          {/* Order Registration Form */}
          <div className="order-input"> {/* Similar to 'login-input' */}
            <form>
              <label>Departure Address</label>
              <input type="text" placeholder="Departure Address" required />
  
              <label>Destination Address</label>
              <input type="text" placeholder="Destination Address" required />
  
              <label>Date & Time</label>
              <input type="datetime-local" required />
  
              <button type="submit">Swopp away!</button>
            </form>
          </div>
        </div>
  
        {/* Navigation Bar */}
        <NavBar />
      </div>
    );
  };
  
  export default Order;

