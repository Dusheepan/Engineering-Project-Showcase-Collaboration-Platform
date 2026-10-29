import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container page-container not-found-page text-center">
      <div className="card not-found-card">
        <div className="not-found-badge">Engineering Showcase</div>
        <div className="not-found-visual">
          <span className="not-found-gear">⚙️</span>
          <span className="error-code">404</span>
          <span className="not-found-search">🔍</span>
        </div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-desc text-muted">
          The engineering project, prototype, or route you requested does not exist, was renamed,
          or is temporarily unavailable.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            🏠 Return to Home
          </Link>
          <Link to="/projects" className="btn btn-outline">
            🚀 Browse Showcase
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            📁 Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
