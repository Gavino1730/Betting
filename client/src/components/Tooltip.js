import React, { useState } from 'react';
import '../styles/Tooltip.css';

function Tooltip({ text, children, position = 'top' }) {
  const [show, setShow] = useState(false);

  return (
    <div className="tooltip-container" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onTouchStart={() => setShow(true)} onTouchEnd={() => setShow(false)}>
      {children}
      {show && (
        <div className={`tooltip tooltip-${position}`}>
          {text}
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
}

export default Tooltip;
