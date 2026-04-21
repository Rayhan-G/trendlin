// src/components/editor/SmartToolbar.jsx
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const SmartToolbar = ({ children, targetRef, offsetY = 0 }) => {
  const [position, setPosition] = useState({ top: 0, left: 0, visible: false });
  const toolbarRef = useRef(null);
  
  useEffect(() => {
    if (!targetRef?.current) return;
    
    const updatePosition = () => {
      const targetRect = targetRef.current.getBoundingClientRect();
      const toolbarHeight = toolbarRef.current?.offsetHeight || 50;
      const toolbarWidth = toolbarRef.current?.offsetWidth || 200;
      const viewportHeight = window.innerHeight;
      
      let top = targetRect.bottom + offsetY;
      let left = targetRect.left + (targetRect.width / 2);
      
      // If toolbar would go below viewport, place it above
      if (top + toolbarHeight > viewportHeight - 10) {
        top = targetRect.top - toolbarHeight - offsetY;
      }
      
      // If toolbar would go above viewport, place it below
      if (top < 10) {
        top = targetRect.bottom + offsetY;
      }
      
      // Keep within viewport horizontally
      const minLeft = toolbarWidth / 2 + 10;
      const maxLeft = window.innerWidth - toolbarWidth / 2 - 10;
      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;
      
      setPosition({
        top: top,
        left: left,
        visible: true
      });
    };
    
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [targetRef, offsetY]);
  
  if (!position.visible) return null;
  
  return createPortal(
    <div
      ref={toolbarRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        zIndex: 99999,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export default SmartToolbar;