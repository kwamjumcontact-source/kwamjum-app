import React from 'react';
import './ProgressHeader.css';

const ProgressHeader = ({ current, total, streak }) => {
  const percentage = total > 0 ? (current / total) * 100 : 100;

  return (
    <div className="progress-header">
      <div className="stats-row">
        <div className="streak-badge">
          <span className="fire-icon">🔥</span>
          <span className="streak-count">{streak} Day Streak!</span>
        </div>
        <div className="cards-count">
          {current} / {total} Cards
        </div>
      </div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressHeader;
