import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css'; 

const NavBar = () => {
  return (
    <nav className="nav-bar">
      <div className="nav-container">
        <Link to="/home" className="nav-link">Home</Link> {/* Home Tab */}
        <Link to="/UserPage" className="nav-link">User</Link> {/* User Tab */}
      </div>
    </nav>
  );
};

export default NavBar;
