import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainIndex from "./Components/User/MainIndex";
import Login from "./Components/User/Login/Login";
import Register from "./Components/User/Register/Register";
import Order from "./Components/Order/Order";
import UserPage from "./Components/UserPage/UserPage";
import { UserProvider } from "./Components/Context/UserContext";
import ProtectedRoute from "./Components/ProtectedComponent";
import AllOrders from "./Components/Order/OrderDashboard";
import CreateItem from "./Components/Order/CreateItem";
import OrderDashboard from "./Components/Order/OrderDashboard";


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
            </ProtectedRoute>} />
          <Route path="/all-orders" element={<AllOrders />} />
          <Route path="/create-item" element={<CreateItem />} />
          <Route path="/order-dashboard" element={<OrderDashboard />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
