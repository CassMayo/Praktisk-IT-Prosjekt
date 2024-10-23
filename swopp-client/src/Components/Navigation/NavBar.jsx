import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css'; // We will add styles here later

const BottomNavBar = () => {
  return (
    <nav className="bottom-nav">
      <Link to="/" className="nav-link">
        Home
      </Link>
      <Link to="/order" className="nav-link">
        Order
      </Link>
      <Link to="/UserPage" className="nav-link">
        User
      </Link>
    </nav>
  );
};

export default BottomNavBar;
