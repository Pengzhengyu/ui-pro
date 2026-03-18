import React, { useState, useRef } from 'react';
import './HolographicCard.css';

/**
 * HolographicCard - 具有 3D 旋转和动态光影反射效果的高级卡片
 * @param {string} title - 卡片标题
 * @param {ReactNode} children - 卡片主体内容
 * @param {string} category - 分类标签文字
 */
const HolographicCard = ({ title, children, category = 'General' }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glintPos, setGlintPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    const rX = (yPercent - 50) / 3; // Max 15 degree
    const rY = (50 - xPercent) / 3;

    setRotateX(rX);
    setRotateY(rY);
    setGlintPos({ x: xPercent, y: yPercent });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlintPos({ x: 50, y: 50 });
  };

  return (
    <div 
      className="holo-card-wrapper"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
    >
      <div 
        className="holo-card-glint"
        style={{
          background: `radial-gradient(circle at ${glintPos.x}% ${glintPos.y}%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`,
        }}
      />
      <div className="holo-card-content">
        <span className="holo-category">{category}</span>
        <h3 className="holo-title">{title}</h3>
        <div className="holo-body">{children}</div>
      </div>
      <div className="holo-card-border" />
    </div>
  );
};

export default HolographicCard;
