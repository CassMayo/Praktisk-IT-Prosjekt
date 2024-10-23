import React, { createContext, useState, useEffect } from "react";

// Create the UserContext
export const UserContext = createContext();

// Create the UserProvider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user information (name, email, etc.)
  const [token, setToken] = useState(null); // Store JWT token

  // Function to log in the user and store their information and token
    //If we want to centralized it later
  const login = (userData, Token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem("token", Token);
  };
  
  // Function to log out the user and clear their data
        //if we want
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

    

  // Function to fetch user profile from the server using the stored token
      //SKRIV KODE HER:
    const fetchUserProfile = async () => {
      if (!token) return; // Make sure a token is available
    
      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          },
        });
    
        if (response.ok) {
          const userData = await response.json();
          setUser(userData); // Update user data in state
         } else {
          console.error("Failed to fetch user profile");
         }
       } catch (error) {
         console.error("Error fetching user profile:", error);
      }
     };

  // Effect to load the token from localStorage when the app loads
        //SKRIV KODE HER:

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(); // Fetch user data after setting the token
    }
  }, [token]); // Re-run if the token changes


  return (
    <UserContext.Provider value={{ user, setUser, token, setToken, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
