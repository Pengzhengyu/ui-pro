import React, { useState, useEffect } from 'react';
import './KeybindingMonitor.css';

/**
 * KeybindingMonitor - 实时捕获并美化显示用户的键盘输入
 */
const KeybindingMonitor = () => {
  const [keys, setKeys] = useState([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timeout;
    
    const handleKeyDown = (e) => {
      // 排除单独的修饰键
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

      setActive(true);
      const activeKeys = [];
      if (e.ctrlKey) activeKeys.push('Ctrl');
      if (e.shiftKey) activeKeys.push('Shift');
      if (e.altKey) activeKeys.push('Alt');
      if (e.metaKey) activeKeys.push('Cmd');
      
      const keyName = e.key === ' ' ? 'Space' : e.key.toUpperCase();
      activeKeys.push(keyName);

      setKeys(activeKeys);

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setActive(false);
      }, 1500);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, []);

  if (!active) return null;

  return (
    <div className="key-monitor-container">
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          <kbd className="key-cap">{k}</kbd>
          {i < keys.length - 1 && <span className="key-plus">+</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default KeybindingMonitor;
