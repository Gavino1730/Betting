import React, { useState, useEffect } from 'react';
import '../styles/SpiritWeekBanner.css';

function SpiritWeekBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem('spiritWeekBannerMinimized') === 'true';
  });

  // Spirit Week dress-up days
  const dressUpDays = [
    { date: new Date('2026-02-02'), theme: "Opening Night Monday", emoji: "🎭" },
    { date: new Date('2026-02-03'), theme: "Twinning Tuesday (Jersey Out)", emoji: "👯" },
    { date: new Date('2026-02-04'), theme: "Wicked Wednesday", emoji: "💚" },
    { date: new Date('2026-02-05'), theme: "Hakuna Matata Thursday", emoji: "😴" },
    { date: new Date('2026-02-06'), theme: "Be Your Broadway Friday", emoji: "🎪" }
  ];

  // Get current and next day's themes
  const getCurrentAndNextDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDayIndex = dressUpDays.findIndex(day => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      return dayDate.getTime() === today.getTime();
    });

    if (currentDayIndex !== -1) {
      // During Spirit Week - show current and next day
      const currentDay = dressUpDays[currentDayIndex];
      const nextDay = currentDayIndex < dressUpDays.length - 1 ? dressUpDays[currentDayIndex + 1] : null;
      return { currentDay, nextDay, beforeSpirit: false };
    }

    // Before Spirit Week - show countdown and first day
    const firstDay = dressUpDays[0];
    const firstDayDate = new Date(firstDay.date);
    firstDayDate.setHours(0, 0, 0, 0);
    
    if (today < firstDayDate) {
      return { currentDay: null, nextDay: firstDay, beforeSpirit: true };
    }

    return { currentDay: null, nextDay: null, beforeSpirit: false };
  };

  const { currentDay, nextDay, beforeSpirit } = getCurrentAndNextDay();

  const handleMinimize = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    localStorage.setItem('spiritWeekBannerMinimized', newState.toString());
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('spiritWeekBannerClosed', 'true');
  };

  // Check if banner was previously closed
  useEffect(() => {
    const wasClosed = localStorage.getItem('spiritWeekBannerClosed') === 'true';
    if (wasClosed) {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`spirit-week-banner ${isMinimized ? 'minimized' : ''}`}>
      <div className="spirit-banner-content">
        {!isMinimized && (
          <>
            <div className="spirit-banner-icon">🎭</div>
            <div className="spirit-banner-text">
              <strong>🌟 Spirit Week: Battle of the Broadways 🌟</strong>
              {currentDay ? (
                <span className="spirit-banner-dates">
                  Today: {currentDay.emoji} {currentDay.theme}
                  {nextDay && ` • Tomorrow: ${nextDay.emoji} ${nextDay.theme}`}
                </span>
              ) : beforeSpirit && nextDay ? (
                <span className="spirit-banner-dates">
                  Starts Monday: {nextDay.emoji} {nextDay.theme}
                </span>
              ) : (
                <span className="spirit-banner-dates">Feb 2-6 • Themed dress-up days, competitions & prizes!</span>
              )}
            </div>
          </>
        )}
        {isMinimized && (
          <div className="spirit-banner-minimized-text">
            {currentDay ? `${currentDay.emoji} ${currentDay.theme}` : 
             beforeSpirit && nextDay ? `Starts Monday: ${nextDay.emoji} ${nextDay.theme}` :
             '🎭 Spirit Week! 🌟'}
          </div>
        )}
        <div className="spirit-banner-controls">
          <button 
            className="spirit-banner-btn minimize" 
            onClick={handleMinimize}
            aria-label={isMinimized ? 'Expand banner' : 'Minimize banner'}
          >
            {isMinimized ? '▼' : '▲'}
          </button>
          <button 
            className="spirit-banner-btn close" 
            onClick={handleClose}
            aria-label="Close banner"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="spirit-banner-sparkles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="sparkle" style={{
            left: `${(i + 1) * 8}%`,
            animationDelay: `${i * 0.15}s`
          }}></div>
        ))}
      </div>
    </div>
  );
}

export default SpiritWeekBanner;
