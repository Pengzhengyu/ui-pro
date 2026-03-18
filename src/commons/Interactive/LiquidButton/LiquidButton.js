import React, { useState } from 'react';
import './LiquidButton.css';

/**
 * LiquidButton - 具有流体融合效果的交互按钮
 * @param {ReactNode} children - 按钮文字或图标
 * @param {Function} onClick - 点击回调
 * @param {string} color - 按钮主色调 (Hex/RGB)
 */
const LiquidButton = ({ children, onClick, color = '#6366f1' }) => {
  return (
    <>
      <div className="liquid-button-container">
        <button className="liquid-button" onClick={onClick} style={{ '--btn-color': color }}>
          <span className="btn-text">{children}</span>
          <div className="btn-liquids">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="liquid-bubble"></div>
            ))}
          </div>
        </button>
      </div>

      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    </>
  );
};

export default LiquidButton;
