import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { UserContext } from "../../Context/UserContext";
import Truck_w_smoke from "../../../Assets/Truck_w_smoke.png";

const Login = () => {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const form = new FormData(event.target);
    const data = {
      email: form.get("email"),
      password: form.get("password"),
    };

    try {
      console.log("Attempting login with:", { email: data.email });
      
      const response = await fetch("http://localhost:5078/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Login response status:", response.status);

      const result = await response.json();
      
      if (response.ok && result.token) {
        console.log("Login successful, setting user data");
        
        // Make sure we have all required user data
        const userData = {
          name: result.name,
          email: result.email,
          // Add any other user fields you need
        };

        await login(userData, result.token);
        console.log("User context updated, navigating to user page");
        
        navigate("/user");
      } else {
        console.error("Login failed:", result);
        setErrorMessage(result.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="login">
      <section className="login-left">
        <section>
          <h1>Welcome back!</h1>
          <h2>We're Happy to see you.</h2>
        </section>
        <div className="login-input">
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              disabled={isLoading}
            />
            
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              disabled={isLoading}
            />
            
            <button 
              type="submit" 
              disabled={isLoading}
              className={isLoading ? 'button-loading' : ''}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </section>
      <div className="login-right">
        <img src={Truck_w_smoke} alt="Truck with smoke" />
      </div>
    </article>
  );
};

export default Login;