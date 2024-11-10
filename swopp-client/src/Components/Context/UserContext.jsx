import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize state from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const login = async (userData, newToken) => {
    try {
      // Save to localStorage
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Update state
      setToken(newToken);
      setUser(userData);
      
      console.log("Login successful:", { userData, newToken });
    } catch (error) {
      console.error("Error during login:", error);
      // Clean up in case of error
      logout();
      throw error;
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear state
    setToken(null);
    setUser(null);
    
    console.log("Logout completed");
  };

  const fetchUserProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching user profile with token:", token);
      
      const response = await fetch("http://localhost:5078/api/user/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Profile response status:", response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log("Profile data received:", userData);
        
        // Update localStorage and state with fresh user data
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } else if (response.status === 401) {
        console.log("Token invalid or expired");
        logout();
      } else {
        console.error("Failed to fetch user profile:", response.status);
        // Don't logout on other errors
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Don't logout on network errors
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile when token changes
  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user) {
        await fetchUserProfile();
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  // Debug logging
  useEffect(() => {
    console.log("UserContext state updated:", { user, token, loading });
  }, [user, token, loading]);

  const contextValue = {
    user,
    token,
    loading,
    login,
    logout,
    fetchUserProfile
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};