import React from "react";
import "./Login.css";
    
const Login = () => {
    //Handle the login form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
    
        //Send the login request to the server
        fetch("http://localhost:5078/api/sender/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Login failed.");
        })
        .then((data) => {
            //Save the token in local storage
            localStorage.setItem("token", data.token);
    
            //Redirect to the home page
            window.location.href = "/";
        })
        .catch((error) => {
            console.error(error);
        });
    }

    return (
        <div className="Login">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />
                <button type="submit">Login</button>
            </form>
        </div>
    );

    }

export default Login;