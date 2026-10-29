import React from 'react';

/**
 * Footer Component
 * Renders consistent site-wide footer with copyright and architecture information.
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p>© {new Date().getFullYear()} Engineering Showcase — Faculty of Engineering</p>
        <p className="footer-subtext">Built with MERN Stack (Node.js, Express, MongoDB, React, Vite)</p>
      </div>
    </footer>
  );
};

export default Footer;
