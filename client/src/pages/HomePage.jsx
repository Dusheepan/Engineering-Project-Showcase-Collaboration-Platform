import React from 'react';
import { Link } from 'react-router-dom';

/**
 * HomePage Component
 * Landing view highlighting platform capabilities, quick exploration actions,
 * and entry points to the student project directory.
 */
const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-badge">Engineering Showcase Platform</div>
          <h1 className="hero-title">
            Discover Inspiring <span className="highlight">Student Engineering</span> Projects
          </h1>
          <p className="hero-subtitle">
            A centralized showcase for engineering student innovations, capstone projects,
            hardware designs, and software systems.
          </p>
          <div className="hero-actions">
            <Link to="/projects" className="btn btn-primary btn-lg">
              Explore Showcase
            </Link>
            <Link to="/projects/new" className="btn btn-outline btn-lg">
              Submit Your Project
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title text-center">Core Capabilities</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Browse & Search</h3>
              <p>Filter projects by engineering discipline, development status, or search by keywords.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Showcase Innovation</h3>
              <p>Present project descriptions, architecture, team members, supervisor, and repository links.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Full CRUD Management</h3>
              <p>Effortlessly submit new engineering projects, revise details, and maintain an updated archive.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
