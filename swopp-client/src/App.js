import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainIndex from "./Components/User/MainIndex";
import Login from "./Components/User/Login/Login";
import Register from "./Components/User/Register/Register";
import Order from "./Components/Order/Order";
import UserPage from "./Components/UserPage/UserPage";
<<<<<<< HEAD
import HomePage from './Components/Home/HomePage';
import NavBar from './Components/Navigation/NavBar';
=======
import { UserProvider } from "./Components/Context/UserContext";
import ProtectedRoute from "./Components/ProtectedComponent";
import AllOrders from "./Components/Order/OrderDashboard";
import CreateItem from "./Components/Order/CreateItem";
import OrderDashboard from "./Components/Order/OrderDashboard";
>>>>>>> main


const App = () => {
  return (
<<<<<<< HEAD
    <Router>
      <Routes>
        <Route path="/" element={<MainIndex />} /> {/* MainIndex for login/register */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/order" element={<Order />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/home" element={<HomePage />} /> {/* Home page after login */}
      </Routes>
    </Router>
=======
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
>>>>>>> main
  );
}

export default App;
