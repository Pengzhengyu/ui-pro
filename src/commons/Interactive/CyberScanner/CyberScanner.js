import React from 'react';
import './CyberScanner.css';

/**
 * CyberScanner - A wrapper component that adds a futuristic scanning effect.
 */
const CyberScanner = ({ children, active = true }) => {
  return (
    <div className={`cyber-scanner-root ${active ? 'active' : ''}`}>
      <div className="scanner-container">
        {children}
        <div className="scanner-line"></div>
        <div className="scanner-corners">
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
        </div>
        <div className="scanner-overlay"></div>
      </div>
    </div>
  );
};

export default CyberScanner;
