import React, { useState, useEffect, useCallback } from 'react';
import './InteractiveTour.css';

/**
 * InteractiveTour - 引导式新手教程组件
 * @param {Array} steps - 步骤定义 [{ target: selector, title, content, mandatory: boolean }]
 * @param {boolean} active - 是否开启引导
 * @param {Function} onFinish - 引导完成回调
 */
const InteractiveTour = ({ steps = [], active = false, onFinish }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState(null);

  const updateHighlight = useCallback(() => {
    const step = steps[currentStepIndex];
    if (!step) return;

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect({
        top: rect.top - 5,
        left: rect.left - 5,
        width: rect.width + 10,
        height: rect.height + 10,
      });
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [steps, currentStepIndex]);

  useEffect(() => {
    if (active) {
      updateHighlight();
      window.addEventListener('resize', updateHighlight);
    }
    return () => window.removeEventListener('resize', updateHighlight);
  }, [active, updateHighlight]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onFinish && onFinish();
    }
  };

  if (!active || !highlightRect) return null;

  const currentStep = steps[currentStepIndex];

  return (
    <div className="tour-overlay">
      <div 
        className="tour-hole" 
        style={{
          top: highlightRect.top,
          left: highlightRect.left,
          width: highlightRect.width,
          height: highlightRect.height
        }}
      />
      <div 
        className="tour-tooltip"
        style={{
          top: highlightRect.top + highlightRect.height + 20,
          left: highlightRect.left + highlightRect.width / 2
        }}
      >
        <div className="tooltip-header">
           <span className="step-badge">{currentStepIndex + 1} / {steps.length}</span>
           <h3>{currentStep.title}</h3>
        </div>
        <p>{currentStep.content}</p>
        <div className="tooltip-footer">
          <button className="tour-next-btn" onClick={handleNext}>
            {currentStepIndex === steps.length - 1 ? '完成' : '下一步'}
          </button>
        </div>
        <div className="tooltip-arrow" />
      </div>
    </div>
  );
};

export default InteractiveTour;
