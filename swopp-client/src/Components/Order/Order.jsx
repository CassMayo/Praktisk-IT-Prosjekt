import React, { useContext } from "react";
import { UserContext } from "../Context/UserContext";

    const Order = () => {
        const { user } = useContext(UserContext);
        console.log("User data in Order component:", user); 

        return (
            <div>
            <h1>Swopp</h1>
            <p>Welcome, {user.name}!</p>
            <p>ORDER REGISTRATION</p>
            </div>
        );
        }

    export default Order;