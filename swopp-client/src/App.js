import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainIndex from "./Components/User/MainIndex";
import Login from "./Components/User/Login/Login";
import Register from "./Components/User/Register/Register";
import Order from "./Components/Order/Order";
import UserPage from "./Components/UserPage/UserPage";
import { UserProvider } from "./Components/Context/UserContext"; 
import ProtectedRoute from "./Components/ProtectedComponent";


const App = () => {
  return (
    <UserProvider>
    <Router>
      <Routes>
        <Route path="/" element={<MainIndex />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/order" element={<Order />} />
        <Route path="/user" element={
          <ProtectedRoute>
            <UserPage />
          </ProtectedRoute>}/> 
        </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
