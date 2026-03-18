import React, { useRef, useState } from 'react';
import './FloatingDock.css';

/**
 * FloatingDock - 鱼眼缩放效果的工具栏
 */
const FloatingDock = ({ items = [] }) => {
  const mouseX = useRef(Infinity);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div 
      className="dock-wrapper"
      onMouseMove={(e) => {
        mouseX.current = e.pageX;
      }}
      onMouseLeave={() => {
        mouseX.current = Infinity;
        setHoveredIndex(null);
      }}
    >
      <div className="dock-container">
        {items.map((item, i) => (
          <DockItem 
            key={i} 
            mouseX={mouseX} 
            icon={item.icon} 
            label={item.label}
            onClick={item.onClick}
          />
        ))}
      </div>
    </div>
  );
};

const DockItem = ({ mouseX, icon, label, onClick }) => {
  const ref = useRef(null);
  const [size, setSize] = useState(40);

  // 简单的鱼眼逻辑：根据鼠标距离计算缩放
  React.useEffect(() => {
    const update = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX.current - centerX);
      
      // 影响范围 150px
      const scale = Math.max(1, 1.8 * (1 - distance / 150));
      setSize(40 * scale);
      
      requestAnimationFrame(update);
    };
    const id = requestAnimationFrame(update);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="dock-item-container" onClick={onClick}>
      <div 
        ref={ref} 
        className="dock-item" 
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <span className="dock-icon">{icon}</span>
        <div className="dock-tooltip">{label}</div>
      </div>
    </div>
  );
};

export default FloatingDock;
