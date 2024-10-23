import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainIndex from "./Components/User/MainIndex";
import Login from "./Components/User/Login/Login";
import Register from "./Components/User/Register/Register";
import Order from "./Components/Order/Order";
import UserPage from "./Components/UserPage/UserPage";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainIndex />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/order" element={<Order />} />
        <Route path="/user" element={<UserPage />} />
      </Routes>
    </Router>
  );
}

export default App;
