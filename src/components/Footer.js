import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="modern-footer">
        <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Collection Analytics</h3>
            <p className="footer-description">
              Comprehensive data analysis and reporting solution for Walton divisions and areas.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="section-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#upload">Upload Data</a></li>
              <li><a href="#division">Division Summary</a></li>
              <li><a href="#area">Area Summary</a></li>
              <li><a href="#statistics">Statistics</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="section-title">Contact Developer</h4>
            <div className="contact-links">
              <a 
                href="https://wa.me/8801712394851" 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-link whatsapp"
              >
                <span className="contact-icon">📱</span>
                <span>WhatsApp: +8801712394851</span>
              </a>
              <a 
                href="https://www.facebook.com/rezaul2000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-link facebook"
              >
                <span className="contact-icon">👤</span>
                <span>Facebook Profile</span>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="section-title">Developer</h4>
            <div className="developer-info">
              <p className="developer-name">Md. Rezaul Karim RCM</p>
              <p className="developer-role">Tech & Data Lover</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="footer-copyright">
            <p>&copy; {currentYear} Walton Analytics. All rights reserved.</p>
            <p className="made-with">Made with <span className="heart">❤️</span> by Md. Rezaul Karim RCM</p>
          </div>
        </div>
      </div>
      </footer>
      <div className="developer-banner bottom">
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
    </>
  );
}

export default Footer;
