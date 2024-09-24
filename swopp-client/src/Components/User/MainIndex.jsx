import React from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import "./MainIndex.css";
import WhiteLogo from "../../Assets/White_Swopp.png"; // Import the Swopp logo

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
      <div className="Logo">
        <img src={WhiteLogo} alt="Swopp Logo" />
      </div>
      <div className="Button">
      <button onClick={goToLogin}>Login</button>
      <button onClick={goToRegister}>Register</button>
      </div>
    </article>
  );
};

export default UserPage;
