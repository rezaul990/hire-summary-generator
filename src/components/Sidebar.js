import React from 'react';
import './Sidebar.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <h3 className="sidebar-title">🛠️ More Useful Tools for RCM</h3>
        
        <div className="tool-card">
          <div className="tool-icon">📊</div>
          <h4 className="tool-name">Excel Data Cleaner</h4>
          <p className="tool-description">Clean and format your Excel data efficiently</p>
          <a 
            href="https://exceldatacleaner.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="tool-link"
          >
            Open Tool →
          </a>
        </div>

        <div className="tool-card">
          <div className="tool-icon">🧮</div>
          <h4 className="tool-name">Overdue Calculator</h4>
          <p className="tool-description">Calculate and analyze overdue amounts</p>
          <a 
            href="https://overduecalculatordev.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="tool-link"
          >
            Open Tool →
          </a>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
