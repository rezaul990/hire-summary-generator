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
    
    console.log('Opening Person ID Report:', { isDevelopment, url });
    
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (!newWindow) {
      alert('Pop-up blocked! Please allow pop-ups for this site and try again.');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <h3 className="sidebar-title">🛠️ More Useful Tools for RCM</h3>
        
        <div className="tools-container">
          <a 
            href="https://exceldatacleaner.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="tool-card highlighted"
          >
            <div className="tool-icon">📊</div>
            <h4 className="tool-name">Excel Data Cleaner</h4>
            <span className="tool-link">Open Tool →</span>
          </a>

          <a 
            href="https://overduecalculatordev.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="tool-card highlighted"
          >
            <div className="tool-icon">🧮</div>
            <h4 className="tool-name">Overdue Calculator</h4>
            <span className="tool-link">Open Tool →</span>
          </a>

          <button 
            onClick={handlePersonIdReport}
            className="tool-card highlighted tool-button-card"
            title="Generate Person ID Reports"
          >
            <div className="tool-icon">👤</div>
            <h4 className="tool-name">Person ID Report</h4>
            <span className="tool-link">Open Tool →</span>
          </button>

          <a 
            href="https://salessummary.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="tool-card highlighted"
          >
            <div className="tool-icon">📈</div>
            <h4 className="tool-name">Sales Breakdown Analyze</h4>
            <span className="tool-link">Open Tool →</span>
          </a>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
