import React, { useState } from 'react';
import './GlassConsole.css';

/**
 * GlassConsole - 具有拟物化物理反馈的控制面板
 */
const GlassConsole = ({ title = "SYSTEM CONTROL", controls = [] }) => {
  return (
    <div className="glass-console">
      <div className="console-header">
        <div className="console-led" />
        <span className="console-label">{title}</span>
      </div>
      <div className="console-grid">
        {controls.map((control, i) => (
          <ConsoleButton 
            key={i} 
            label={control.label} 
            onClick={control.onClick}
            color={control.color}
            active={control.active}
          />
        ))}
      </div>
    </div>
  );
};

const ConsoleButton = ({ label, onClick, color = "#6366f1", active = false }) => {
  const [pressed, setPressed] = useState(false);

  return (
    <div 
      className={`console-btn-wrap ${pressed ? 'pressed' : ''} ${active ? 'is-active' : ''}`}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      style={{ '--btn-color': color }}
    >
      <div className="console-btn-inner">
        <div className="btn-indicator" />
        <span className="btn-label">{label}</span>
      </div>
    </div>
  );
};

export default GlassConsole;
