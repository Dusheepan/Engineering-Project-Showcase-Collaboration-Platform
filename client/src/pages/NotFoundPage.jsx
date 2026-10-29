import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container page-container text-center">
      <div className="card not-found-card">
        <h1 className="error-code">404</h1>
        <h2>Page Not Found</h2>
        <p className="text-muted">
          The engineering project or page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary mt-3">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
