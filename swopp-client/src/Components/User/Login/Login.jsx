import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import "./Login.css";
import { UserContext } from "../../Context/UserContext"; // Import the UserContext
import Truck_w_smoke from "../../../Assets/Truck_w_smoke.png"; // Import the truck image

const Login = () => {
    const [errorMessage, setErrorMessage] = useState(''); // Add state for error message
    const navigate = useNavigate(); // Initialize navigate for redirection
    const { setUser } = useContext(UserContext); // Get the setUser function from the context

    // Define the function to handle form submission
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
                setErrorMessage(''); // Clear any error
                console.log("API response:", result); // Check if name and email are coming correctly

                // Store the token in local storage
                localStorage.setItem('token', result.token);

                // Set the user in the context
                setUser({ name: result.name, email: result.email }); 
                
                // Navigate to order page
                navigate("/Order"); 
            } else {
                const errorData = await response.json();
                console.log(errorData); // Log the error for debugging
                if (errorData.errors) {
                    // Display specific validation errors (e.g., missing fields)
                    setErrorMessage(errorData.errors);
                } else {
                    setErrorMessage(errorData.message || "Login failed. Please try again.");
                }
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