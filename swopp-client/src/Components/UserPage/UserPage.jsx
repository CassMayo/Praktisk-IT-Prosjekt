import React, { useContext } from "react";
import { UserContext } from "../Context/UserContext";

    const UserPage = () => {
        const { user } = useContext(UserContext); //Access user and token from context  
        console.log("User data in Order component:", user); 

        return (
            <div>
                <div>
            <h1>Swopp</h1>
            <p>{user.name}!</p>
            </div>
            <div>
            <h2>Your Orders</h2>
            <p>Order 1</p>
            </div>
            </div>
        );
        }

    export default UserPage;