import React from 'react';
import './PollResults.css';

const PollResults = ({ poll, results, hasAnswered, timeUp }) => {
  if (!poll || !results) return null;

  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);

  const getPercentage = (count) => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  const getResultClass = (option) => {
    const maxCount = Math.max(...Object.values(results));
    return results[option] === maxCount && maxCount > 0 ? 'winning-option' : '';
  };

  return (
    <div className="poll-results">
      <div className="results-header">
        <h3>{poll.question}</h3>
        <div className="results-info">
          {timeUp && <span className="time-up">⏰ Time's up!</span>}
          {hasAnswered && <span className="answered">✅ You answered</span>}
          <span className="total-votes">{totalVotes} total votes</span>
        </div>
      </div>

      <div className="results-list">
        {poll.options.map((option, index) => {
          const count = results[option] || 0;
          const percentage = getPercentage(count);
          
          return (
            <div 
              key={index} 
              className={`result-item ${getResultClass(option)}`}
            >
              <div className="result-header">
                <span className="option-text">{option}</span>
                <span className="result-stats">
                  {count} votes ({percentage}%)
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {!poll.isActive && (
        <div className="poll-ended">
          <p>📊 Poll has ended</p>
        </div>
      )}
    </div>
  );
};

export default PollResults;
