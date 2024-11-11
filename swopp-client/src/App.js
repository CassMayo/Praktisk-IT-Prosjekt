import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import MainIndex from "./Components/User/MainIndex";
import Login from "./Components/User/Login/Login";
import Register from "./Components/User/Register/Register";
import Order from "./Components/Order/Order";
import UserPage from "./Components/UserPage/UserPage";
import HomePage from './Components/Home/HomePage';
import NavBar from './Components/Navigation/NavBar';
import { UserProvider } from "./Components/Context/UserContext";
import ProtectedRoute from "./Components/ProtectedComponent";
import AllOrders from "./Components/Order/OrderDashboard";
import CreateItem from "./Components/Order/CreateItem";
import OrderDashboard from "./Components/Order/OrderDashboard";
import UserOrders from "./Components/customHooks/UserOrders";
import MyOrder from "./Components/Order/MyOrder";




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
            <Route path="/home" element={<HomePage />} /> {/* Home page after login */}
          <Route path="/all-orders" element={<AllOrders />} />
          <Route path="/create-item" element={<CreateItem />} />
          <Route path="/order-dashboard" element={<OrderDashboard />} />
          <Route path="/user-orders" element={<UserOrders />} />
          <Route path="/my-order" element={<MyOrder />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
