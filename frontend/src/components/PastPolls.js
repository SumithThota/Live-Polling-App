import React from 'react';
import './PastPolls.css';

const PastPolls = ({ polls }) => {
  if (polls.length === 0) {
    return (
      <div className="past-polls">
        <div className="no-polls">
          <h2>No Past Polls</h2>
          <p>Previous poll results will appear here after polls are completed.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getWinningOption = (results) => {
    const maxVotes = Math.max(...Object.values(results));
    return Object.keys(results).find(option => results[option] === maxVotes);
  };

  const getWinningStudents = (poll) => {
    console.log('Poll data:', poll); // Debug log
    console.log('Correct answer:', poll.correctAnswer);
    console.log('Student answers:', poll.studentAnswers);
    
    if (!poll.correctAnswer || !poll.studentAnswers) return [];
    
    const winners = poll.studentAnswers
      .filter(student => student.isCorrect === true)
      .map(student => student.studentId);
      
    console.log('Winners found:', winners); // Debug log
    return winners;
  };

  return (
    <div className="past-polls">
      <div className="polls-header">
        <h2>Past Poll Results</h2>
        <span className="polls-count">{polls.length} completed polls</span>
      </div>

      <div className="polls-list">
        {polls.map((poll, index) => {
          const totalVotes = Object.values(poll.results).reduce((sum, count) => sum + count, 0);
          const winningOption = getWinningOption(poll.results);
          const winningStudents = getWinningStudents(poll);
          const participationRate = Math.round((poll.answeredStudents / Math.max(poll.totalStudents, 1)) * 100);

          return (
            <div key={poll.id || index} className="poll-card">
              <div className="poll-header">
                <h3>{poll.question}</h3>
                <span className="poll-date">{formatDate(poll.createdAt)}</span>
              </div>

              <div className="poll-stats">
                <div className="stat">
                  <span className="stat-label">Total Votes:</span>
                  <span className="stat-value">{totalVotes}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Participation:</span>
                  <span className="stat-value">
                    {poll.answeredStudents}/{poll.totalStudents} ({participationRate}%)
                  </span>
                </div>
                {poll.correctAnswer && (
                  <div className="stat">
                    <span className="stat-label">Accuracy:</span>
                    <span className="stat-value">
                      {poll.correctAnswers}/{poll.answeredStudents} ({poll.accuracyRate}%)
                    </span>
                  </div>
                )}
                <div className="stat">
                  <span className="stat-label">Duration:</span>
                  <span className="stat-value">{poll.timeLimit}s</span>
                </div>
              </div>

              <div className="poll-results">
                <h4>Results:</h4>
                <div className="results-bars">
                  {Object.entries(poll.results).map(([option, count]) => {
                    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isWinning = option === winningOption;
                    const isCorrect = poll.correctAnswer === option;

                    return (
                      <div key={option} className={`result-bar ${isWinning ? 'winning' : ''} ${isCorrect ? 'correct' : ''}`}>
                        <div className="bar-header">
                          <span className="option-name">
                            {option}
                            {isCorrect && <span className="correct-badge">✓ Correct</span>}
                          </span>
                          <span className="vote-info">
                            {count} votes ({percentage}%)
                          </span>
                        </div>
                        <div className="bar-visual">
                          <div 
                            className="bar-fill"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {poll.studentAnswers && poll.studentAnswers.length > 0 && (
                <div className="student-answers">
                  <h4>Student Responses:</h4>
                  <div className="answers-grid">
                    {poll.studentAnswers.map((student, idx) => (
                      <div key={idx} className={`student-answer ${student.isCorrect === true ? 'correct' : student.isCorrect === false ? 'incorrect' : 'neutral'}`}>
                        <span className="student-name">{student.studentId}</span>
                        <span className="student-choice">{student.answer}</span>
                        {student.isCorrect !== null && (
                          <span className={`answer-indicator ${student.isCorrect ? 'correct' : 'incorrect'}`}>
                            {student.isCorrect ? '✓' : '✗'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Winner Display Logic */}
              {poll.correctAnswer ? (
                // For polls with correct answers, show students who got it right
                winningStudents.length > 0 ? (
                  <div className="winner-info">
                    <span className="winner-label">🏆 Winners (Correct Answer):</span>
                    <span className="winner-students">{winningStudents.join(', ')}</span>
                  </div>
                ) : (
                  <div className="winner-info">
                    <span className="winner-label">🏆 Winners:</span>
                    <span className="winner-option">No one got the correct answer</span>
                  </div>
                )
              ) : (
                // For polls without correct answers, show most popular option
                winningOption && (
                  <div className="winner-info">
                    <span className="winner-label">🏆 Most Popular Answer:</span>
                    <span className="winner-option">{winningOption}</span>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PastPolls;
