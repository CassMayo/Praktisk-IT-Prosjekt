import React from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import "./MainIndex.css";

const UserPage = () => {
  const navigate = useNavigate(); // Initialize the hook for navigation

  // Define the function to navigate to the login page
  const goToLogin = () => {
    navigate("/login");
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <article className="MainIndex">
      <h2>SWOPPPPP</h2>
      <button onClick={goToLogin}>Go to Login</button>
      <button onClick={goToRegister}>Go to Register</button>
    </article>
  );
};

export default UserPage;
