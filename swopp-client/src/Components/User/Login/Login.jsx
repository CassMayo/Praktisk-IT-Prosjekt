import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import "./Login.css";
import { UserContext } from "../../Context/UserContext"; // Import the UserContext

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
            const response = await fetch("http://localhost:5078/api/sender/login", {
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
                setUser({name: result.name, email: result.email}); // Set the user in the context
                navigate("/Order"); // Navigate to order page
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
        <div className="Login">
            <h2>Login</h2>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message */}
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
