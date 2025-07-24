import React from 'react';
import { X } from 'lucide-react';
import '../styles/AlertPopup.css';

const AlertPopup = React.memo(({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="alert-popup-overlay">
      <div className={`alert-popup-container ${type}`}>
        <div className="alert-popup-header">
          <h3>{title}</h3>
          {showCloseButton && (
            <button className="alert-popup-close-button" onClick={onClose}>
              <X size={24} />
            </button>
          )}
        </div>
        <div className="alert-popup-content">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
});

export default AlertPopup; 