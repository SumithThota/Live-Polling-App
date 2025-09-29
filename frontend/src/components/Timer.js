import React from 'react';
import './Timer.css';

const Timer = ({ timeRemaining, totalTime }) => {
  const percentage = (timeRemaining / totalTime) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const formatTime = () => {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (percentage > 50) return 'timer-good';
    if (percentage > 20) return 'timer-warning';
    return 'timer-danger';
  };

  return (
    <div className={`timer ${getTimerClass()}`}>
      <div className="timer-circle">
        <svg className="timer-svg" viewBox="0 0 100 100">
          <circle
            className="timer-background"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="#e5e5e5"
            strokeWidth="8"
          />
          <circle
            className="timer-progress"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="timer-text">
          {formatTime()}
        </div>
      </div>
    </div>
  );
};

export default Timer;
