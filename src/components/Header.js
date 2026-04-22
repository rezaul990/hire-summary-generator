import React from 'react';
import './Header.css';

function Header({ onScrollToStats, showStatsButton, onSaveYesterdayData, showSaveButton }) {
  return (
    <>
      <div className="developer-banner top">
        <p>Made with <span className="heart">❤️</span> by <strong>Md. Rezaul Karim RCM</strong></p>
        <div className="banner-contacts">
          <a 
            href="https://wa.me/8801712394851" 
            target="_blank" 
            rel="noopener noreferrer"
            className="banner-contact-link"
          >
            <span className="banner-contact-icon">📱</span>
            <span>WhatsApp</span>
          </a>
          <a 
            href="https://www.facebook.com/rezaul2000" 
            target="_blank" 
            rel="noopener noreferrer"
            className="banner-contact-link"
          >
            <span className="banner-contact-icon">👤</span>
            <span>Facebook</span>
          </a>
        </div>
      </div>
      <header className="modern-header">
        <div className="header-container">
          <div className="header-top">
            <div className="logo-section">
              <div className="logo-icon">📊</div>
              <div className="logo-text">
                <h1>Collection Summary by Reza</h1>
                <p className="tagline">Collection Analytics By Reza</p>
              </div>
            </div>
            <div className="header-actions">
              {showSaveButton && (
                <button className="save-btn" onClick={onSaveYesterdayData} title="Save as Yesterday's Data">
                  <span className="btn-icon">💾</span>
                </button>
              )}
              {showStatsButton && (
                <button className="stats-btn" onClick={onScrollToStats}>
                  <span className="btn-icon">📈</span>
                  Statistics
                </button>
              )}
            </div>
          </div>
          <div className="header-subtitle">
            <p>Upload your Excel file to generate comprehensive summaries and analytics</p>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
