import React, { useContext } from "react";
import { UserContext } from "../Context/UserContext";

const UserPage = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <div>
        <h1>Swopp</h1>
        <p>Welcome, {user.name}!</p>
        <p>Email: {user.email}</p>
      </div>
      <div>
        <h2>Your Orders</h2>
        <p>Order 1</p>
      </div>
    </div>
  );
};

export default UserPage;