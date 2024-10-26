import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { UserContext } from "../../Context/UserContext";
import Truck_w_smoke from "../../../Assets/Truck_w_smoke.png";

const Login = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(UserContext); // Use login from context

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      email: form.get("email"),
      password: form.get("password"),
    };

    try {
      const response = await fetch("http://localhost:5078/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setErrorMessage("");
        
        // Use the login function from context
        login({ name: result.name, email: result.email }, result.token);
        //console.log("Login response:", result); //This checks the response from the server if we actually get the user data and token
        
        navigate("/user"); // Navigate to user page
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred. Please try again later.");
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
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required />
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" required />
                        <button type="submit">Login</button>
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