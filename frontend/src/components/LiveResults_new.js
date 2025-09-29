import React from 'react';
import './LiveResults.css';

const LiveResults = ({ poll, results, students }) => {
  if (!poll) {
    return (
      <div className="live-results">
        <div className="participants-section">
          <div className="participants-tabs">
            <button className="tab-button">Chat</button>
            <button className="tab-button active">Participants</button>
          </div>
          
          {Object.keys(students).length === 0 ? (
            <div className="no-participants">
              <p>No students connected yet.</p>
            </div>
          ) : (
            <div className="participants-list">
              <table className="participants-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(students).map(([studentId, student]) => (
                    <tr key={studentId}>
                      <td>{student.name}</td>
                      <td>
                        <button className="kick-button">Kick out</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);

  const getPercentage = (count) => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  return (
    <div className="live-results">
      <div className="poll-results-section">
        <h2>Question</h2>
        
        <div className="question-display">
          {poll.question}
        </div>
        
        <div className="options-results">
          {poll.options.map((option, index) => {
            const count = results[option] || 0;
            const percentage = getPercentage(count);
            
            return (
              <div key={index} className="option-result">
                <div className="option-info">
                  <span className="option-number">{index + 1}</span>
                  <span className="option-text">{option}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="percentage">{percentage}%</span>
              </div>
            );
          })}
        </div>
        
        <button className="new-question-btn">+ Ask a new question</button>
      </div>
      
      <div className="participants-section">
        <div className="participants-tabs">
          <button className="tab-button">Chat</button>
          <button className="tab-button active">Participants</button>
        </div>
        
        <div className="participants-list">
          <table className="participants-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(students).map(([studentId, student]) => (
                <tr key={studentId}>
                  <td>{student.name}</td>
                  <td>
                    <button className="kick-button">Kick out</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveResults;
