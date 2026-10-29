import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p>© {new Date().getFullYear()} Engineering Showcase — Faculty of Engineering</p>
        <p className="footer-subtext">Built with MERN Stack</p>
      </div>
    </footer>
  );
};

export default Footer;
