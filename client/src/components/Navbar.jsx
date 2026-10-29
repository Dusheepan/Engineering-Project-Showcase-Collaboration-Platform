import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="brand-logo">
          <span className="brand-icon">⚙️</span>
          <span className="brand-name">Engineering<strong>Showcase</strong></span>
        </Link>

        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Home
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Showcase
          </NavLink>
          <NavLink
            to="/projects/new"
            className={({ isActive }) => (isActive ? 'nav-btn primary active' : 'nav-btn primary')}
          >
            + Submit Project
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
