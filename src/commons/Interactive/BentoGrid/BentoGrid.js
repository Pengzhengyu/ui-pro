import React from 'react';
import './BentoGrid.css';

/**
 * BentoGrid - 响应式多维卡片布局
 * @param {Array} items - [{ title, description, icon, className, background }]
 */
const BentoGrid = ({ items = [] }) => {
  return (
    <div className="bento-grid">
      {items.map((item, i) => (
        <div 
          key={i} 
          className={`bento-item ${item.className || ''}`}
          style={{ background: item.background }}
        >
          <div className="bento-inner">
            <div className="bento-header">
                <span className="bento-icon">{item.icon}</span>
                <span className="bento-tag">{item.tag || 'NEW'}</span>
            </div>
            <div className="bento-body">
              <h3 className="bento-title">{item.title}</h3>
              <p className="bento-desc">{item.description}</p>
            </div>
            <div className="bento-footer">
                <button className="bento-btn">Explore →</button>
            </div>
          </div>
          <div className="bento-glass-shine" />
        </div>
      ))}
    </div>
  );
};

export default BentoGrid;
