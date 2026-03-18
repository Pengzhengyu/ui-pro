import React, { useState, useRef } from 'react';
import './SpringDraggableList.css';

/**
 * SpringDraggableList - 具有物理反馈和弹性动画的可拖拽列表
 */
const SpringDraggableList = ({ initialItems = [] }) => {
  const [items, setItems] = useState(initialItems);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const dragNode = useRef();
  const listRef = useRef();

  const handleDragStart = (e, index) => {
    setDraggingIndex(index);
    dragNode.current = e.target;
    e.dataTransfer.effectAllowed = 'move';
    
    // 延迟添加 dragging 样式，否则拖动的预览图也会变虚
    setTimeout(() => {
        e.target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnter = (e, index) => {
    if (index === draggingIndex) return;
    
    const newItems = [...items];
    const draggedItem = newItems.splice(draggingIndex, 1)[0];
    newItems.splice(index, 0, draggedItem);
    
    setDraggingIndex(index);
    setItems(newItems);
  };

  const handleDragEnd = (e) => {
    setDraggingIndex(null);
    dragNode.current.classList.remove('dragging');
    dragNode.current = null;
  };

  return (
    <div className="spring-list" ref={listRef}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`spring-item ${draggingIndex === index ? 'placeholder' : ''}`}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="item-content">
            <span className="item-handle">⠿</span>
            <span className="item-text">{item.text}</span>
            <span className="item-badge">{item.type}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpringDraggableList;
