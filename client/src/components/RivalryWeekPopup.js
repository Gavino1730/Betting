import React, { useState, useEffect } from 'react';
import '../styles/RivalryWeekPopup.css';

const RivalryWeekPopup = ({ enabled = true, gameInfo = {} }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // Only show if enabled and user hasn't dismissed it this session
    const dismissed = sessionStorage.getItem('rivalryWeekDismissed');
    if (enabled && !dismissed) {
      // Show popup with shake effect
      const timer = setTimeout(() => {
        setShowPopup(true);
        setShake(true);
        
        // Stop shaking after 1 second
        setTimeout(() => setShake(false), 1000);
      }, 500);
      
      // Auto-dismiss after 10 seconds
      const autoDismiss = setTimeout(() => {
        handleClose();
      }, 10500);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(autoDismiss);
      };
    }
  }, [enabled]);

  const handleClose = () => {
    setShowPopup(false);
    sessionStorage.setItem('rivalryWeekDismissed', 'true');
  };

  if (!showPopup) return null;

  const {
    opponent = 'WESTSIDE',
    date = 'Friday, January 10',
    time = '7:00 PM',
    location = 'Home'
  } = gameInfo;

  return (
    <div className={`rivalry-popup-overlay ${shake ? 'shake' : ''}`} onClick={handleClose}>
      <div className="rivalry-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="rivalry-close-btn" onClick={handleClose}>×</button>
        
        <div className="rivalry-image-container">
          <img 
            src="/assets/fight.png" 
            alt="Rivalry Week" 
            className={`rivalry-image ${shake ? 'rumble' : ''}`}
          />
        </div>

        <div className="rivalry-text-container">
          <h1 className="rivalry-title animated">IT'S RIVALRY WEEK</h1>
          <div className="rivalry-matchup animated-delayed">
            <span className="rivalry-team valiant">VC</span>
            <span className="rivalry-vs">VS</span>
            <span className="rivalry-team opponent">{opponent}</span>
          </div>
          <p className="rivalry-tagline animated-delayed-more">SHOW UP!</p>
          
          <div className="rivalry-game-info">
            <div className="rivalry-info-item">
              <span className="info-icon">📅</span>
              <span className="info-text">{date}</span>
            </div>
            <div className="rivalry-info-item">
              <span className="info-icon">⏰</span>
              <span className="info-text">{time}</span>
            </div>
            <div className="rivalry-info-item">
              <span className="info-icon">📍</span>
              <span className="info-text">{location}</span>
            </div>
          </div>

          <button className="rivalry-cta-btn" onClick={handleClose}>
            LET'S GO! 🔥
          </button>
        </div>
      </div>
    </div>
  );
};

export default RivalryWeekPopup;
