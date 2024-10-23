import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css'; // We will add styles here later

const NavBar = () => {
  return (
    <nav className="bottom-nav">
      <Link to="/home" className="nav-link">Home</Link> {/* Home Tab */}
      <Link to="/UserPage" className="nav-link">User</Link> {/* User Tab */}
    </nav>
  );
};

export default NavBar;
