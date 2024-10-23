import React, { createContext, useState, useEffect } from "react";

// Create the UserContext
export const UserContext = createContext();

// Create the UserProvider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user information (name, email, etc.)
  const [token, setToken] = useState(null); // Store JWT token

  // Function to log in the user and store their information and token
    //If we want to centralized it later
  
  // Function to log out the user and clear their data
        //if we want

  // Function to fetch user profile from the server using the stored token
      //SKRIV KODE HER:
      

  // Effect to load the token from localStorage when the app loads
        //SKRIV KODE HER:
  return (
    <UserContext.Provider value={{ user, setUser, token, setToken, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
