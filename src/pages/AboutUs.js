import React from 'react';
import './AboutUs.css';

function AboutUs() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <h1>About Our Platform</h1>
          <p className="lead">Empowering teams with intelligent data analytics and collection management solutions.</p>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <div className="about-section">
            <h2>Our Mission</h2>
            <p>
              We are dedicated to transforming how organizations manage and analyze their collection data. 
              Our platform bridges the gap between raw data and actionable insights, enabling teams to make 
              informed decisions quickly and confidently.
            </p>
          </div>

          <div className="about-section">
            <h2>What We Do</h2>
            <p>
              Our Smart Collection Analytics Platform processes complex Excel data and delivers comprehensive 
              reports with division-level, area-level, and plaza-level insights. We automate the tedious tasks 
              of data aggregation, calculation, and visualization so your team can focus on strategy and execution.
            </p>
          </div>

          <div className="about-section">
            <h2>Key Capabilities</h2>
            <div className="capabilities-grid">
              <div className="capability-item">
                <div className="capability-icon">⚡</div>
                <h3>Instant Processing</h3>
                <p>Upload Excel files and receive instant summaries with zero manual calculation.</p>
              </div>
              <div className="capability-item">
                <div className="capability-icon">📊</div>
                <h3>Multi-Level Analysis</h3>
                <p>Analyze data at division, area, and plaza levels with automatic subtotals and grand totals.</p>
              </div>
              <div className="capability-item">
                <div className="capability-icon">📈</div>
                <h3>Trend Tracking</h3>
                <p>Monitor collection performance, overdue changes, and achievement percentages over time.</p>
              </div>
              <div className="capability-item">
                <div className="capability-icon">🔔</div>
                <h3>Smart Notifications</h3>
                <p>Automated Telegram reports with daily comparisons and growth analysis.</p>
              </div>
              <div className="capability-item">
                <div className="capability-icon">🎯</div>
                <h3>Personalized Views</h3>
                <p>Each user sees their area's data with the ability to share reports as images.</p>
              </div>
              <div className="capability-item">
                <div className="capability-icon">🔒</div>
                <h3>Enterprise Security</h3>
                <p>Google OAuth authentication with role-based access and secure data handling.</p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h2>Why Choose Us</h2>
            <ul className="why-list">
              <li><strong>Built for Real Users:</strong> Designed based on actual field requirements and feedback from collection teams.</li>
              <li><strong>No Training Required:</strong> Intuitive interface that anyone can use from day one.</li>
              <li><strong>Mobile-First Design:</strong> Works seamlessly on desktop, tablet, and mobile devices.</li>
              <li><strong>Continuous Innovation:</strong> Regular updates with new features and improvements.</li>
              <li><strong>Reliable Performance:</strong> Smart caching and optimization deliver lightning-fast load times.</li>
              <li><strong>Data Privacy:</strong> Your data is secure with industry-standard encryption and access controls.</li>
            </ul>
          </div>

          <div className="about-section">
            <h2>Our Vision</h2>
            <p>
              We envision a future where every organization has access to powerful, affordable analytics tools 
              that democratize data-driven decision making. By removing technical barriers and simplifying 
              complex workflows, we enable teams of all sizes to compete with enterprise-level insights.
            </p>
          </div>

          <div className="about-section team-section">
            <h2>Meet the Creator</h2>
            <div className="team-card">
              <div className="team-avatar">👨‍💻</div>
              <h3>Md. Rezaul Karim RCM</h3>
              <p className="team-role">Founder & Developer</p>
              <p className="team-bio">
                Tech enthusiast and data lover with a passion for building practical solutions that solve 
                real-world problems. With deep understanding of collection operations and software development, 
                Rezaul created this platform to empower teams with better tools and insights.
              </p>
              <div className="team-contact">
                <a href="https://wa.me/8801712394851" target="_blank" rel="noopener noreferrer">
                  📱 WhatsApp
                </a>
                <a href="https://www.facebook.com/rezaul2000" target="_blank" rel="noopener noreferrer">
                  👤 Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
