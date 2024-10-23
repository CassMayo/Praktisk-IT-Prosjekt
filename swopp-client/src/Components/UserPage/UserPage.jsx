import React, { useContext } from "react";
import { UserContext } from "../Context/UserContext";
import NavBar from '../Navigation/NavBar';
import HomePage from '../Home/HomePage';


    const UserPage = () => {
        const { user } = useContext(UserContext); //Access user and token from context  

        return (
            <div>
              <div>
                <h1>Swopp</h1>
                <p>Welcome, {user?.name}!</p>
              </div>
              <div>
                <h2>Your Orders</h2>
                <p>Order 1</p>
              </div>
        
              {/* Navigation Bar */}
              <NavBar />
            </div>
          );
        };

    export default HomePage;