import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Smart Collection Analytics Platform</h1>
          <p className="hero-subtitle">
            Transform your collection data into actionable insights with real-time analytics, 
            automated reporting, and comprehensive area-wise tracking.
          </p>
          <div className="hero-buttons">
            <Link to="/app" className="btn btn-primary">Get Started</Link>
            <Link to="/about" className="btn btn-secondary">Learn More</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card">
            <div className="visual-icon">📊</div>
            <h3>Real-Time Analytics</h3>
          </div>
          <div className="visual-card">
            <div className="visual-icon">🎯</div>
            <h3>Target Tracking</h3>
          </div>
          <div className="visual-card">
            <div className="visual-icon">📈</div>
            <h3>Growth Insights</h3>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Powerful Features for Data-Driven Decisions</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🗂️</div>
              <h3>Automated Data Processing</h3>
              <p>Upload Excel files and get instant summaries with division, area, and plaza-level breakdowns.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile-Friendly Reports</h3>
              <p>Share reports as images directly to WhatsApp, Telegram, or download for presentations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Secure Authentication</h3>
              <p>Google OAuth integration with area-based access control and user profile management.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Comprehensive Analytics</h3>
              <p>Track collection targets, overdue statistics, daily comparisons, and growth trends.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Smart caching system delivers instant load times and seamless user experience.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Professional UI</h3>
              <p>Clean, modern interface with color-coded insights and intuitive navigation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <h2 className="section-title">Trusted by Teams Across Divisions</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">45+</div>
              <div className="stat-label">Active Areas</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">Real-Time</div>
              <div className="stat-label">Data Processing</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-label">Secure & Private</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Access Available</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Collection Management?</h2>
          <p>Join teams using our platform to make smarter, data-driven decisions every day.</p>
          <Link to="/app" className="btn btn-primary btn-large">Start Using Now</Link>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
