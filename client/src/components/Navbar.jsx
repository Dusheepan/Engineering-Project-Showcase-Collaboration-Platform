import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu whenever current route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <span className="brand-icon">⚙️</span>
          <span className="brand-name">
            Engineering<strong>Showcase</strong>
          </span>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          className={`hamburger-btn ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        {/* Navigation Links */}
        <nav className={`nav-links ${mobileMenuOpen ? 'nav-mobile-open' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            Showcase
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? 'nav-item active' : 'nav-item'
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/projects/new"
                className={({ isActive }) =>
                  isActive
                    ? 'nav-btn primary active'
                    : 'nav-btn primary'
                }
              >
                + Submit Project
              </NavLink>

              <div className="user-profile-badge">
                <span className="user-avatar-circle">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
                <div className="user-info-text">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-role-tag">{user?.role}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm btn-logout"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="auth-buttons-group">
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
