import React from 'react';
import './Sidebar.css';

function Sidebar() {
  const handlePersonIdReport = () => {
    // In development, open the Vite dev server
    // In production, open the built version
    const isDevelopment = process.env.NODE_ENV === 'development';
    const url = isDevelopment 
      ? 'http://localhost:5173' 
      : '/person-id-report/index.html';
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <h3 className="sidebar-title">🛠️ More Useful Tools for RCM</h3>
        
        <div className="tools-container">
          <div className="tool-card">
            <div className="tool-icon">📊</div>
            <h4 className="tool-name">Excel Data Cleaner</h4>
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
            <a 
              href="https://overduecalculatordev.netlify.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="tool-link"
            >
              Open Tool →
            </a>
          </div>

          <div className="tool-card">
            <div className="tool-icon">👤</div>
            <h4 className="tool-name">Person ID Report</h4>
            <button 
              onClick={handlePersonIdReport}
              className="tool-link tool-button"
              title="Generate Person ID Reports"
            >
              Open Tool →
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
