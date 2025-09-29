import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { socketService } from '../services/socketService';
import { pollAPI } from '../services/api';
import { addMessage } from '../store/chatSlice';
import './LiveResults.css';

const LiveResults = ({ poll, results, students }) => {
  const dispatch = useDispatch();
  const { messages } = useSelector(state => state.chat);
  const { studentName, isTeacher } = useSelector(state => state.user);
  const [activeTab, setActiveTab] = useState('participants');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    socketService.onNewMessage((message) => {
      dispatch(addMessage(message));
    });

    return () => {
      socketService.off('newMessage');
    };
  }, [dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const senderName = isTeacher ? 'Teacher' : studentName;
    const senderType = isTeacher ? 'teacher' : 'student';

    socketService.sendMessage(newMessage.trim(), senderName, senderType);
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleKickStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to remove ${studentName} from the session?`)) {
      try {
        await pollAPI.removeStudent(studentId);
      } catch (error) {
        console.error('Error removing student:', error);
        alert('Failed to remove student. Please try again.');
      }
    }
  };

  if (!poll) {
    return (
      <div className="live-results">
        <div className="participants-section">
          <div className="participants-tabs">
            <button 
              className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button 
              className={`tab-button ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
            >
              Participants
            </button>
          </div>
          
          {activeTab === 'participants' ? (
            Object.keys(students).length === 0 ? (
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
                          <button 
                            className="kick-button"
                            onClick={() => handleKickStudent(studentId, student.name)}
                          >
                            Kick out
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="chat-tab-content">
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`message ${message.senderType}`}
                    >
                      <div className="message-header">
                        <span className="sender-name">{message.sender}</span>
                        <span className="message-time">{formatTime(message.timestamp)}</span>
                      </div>
                      <div className="message-content">
                        {message.message}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={500}
                  disabled={!studentName && !isTeacher}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || (!studentName && !isTeacher)}
                >
                  Send
                </button>
              </form>

              {!studentName && !isTeacher && (
                <div className="chat-disabled">
                  <p>Register first to chat</p>
                </div>
              )}
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

  const getWinningStudents = () => {
    if (!poll.correctAnswer || !students) return [];
    return Object.entries(students)
      .filter(([_, student]) => student.isCorrect === true)
      .map(([_, student]) => student.name);
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
            const isCorrect = poll.correctAnswer === option;
            
            return (
              <div key={index} className={`option-result ${isCorrect ? 'correct-option' : ''}`}>
                <div className="option-info">
                  <span className="option-number">{index + 1}</span>
                  <span className="option-text">{option}</span>
                  {isCorrect && <span className="correct-indicator">✓ Correct</span>}
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${isCorrect ? 'correct-fill' : ''}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="percentage">{percentage}%</span>
              </div>
            );
          })}
        </div>

        {poll.correctAnswer && (
          <div className="winners-section">
            {(() => {
              const winningStudents = getWinningStudents();
              if (winningStudents.length > 0) {
                return (
                  <div className="winner-info">
                    <span className="winner-label">🏆 Students with Correct Answer:</span>
                    <span className="winner-students">{winningStudents.join(', ')}</span>
                  </div>
                );
              } else if (!poll.isActive) {
                return (
                  <div className="winner-info">
                    <span className="winner-label">🏆 Winners:</span>
                    <span className="winner-option">No one got the correct answer</span>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}
        
        <button className="new-question-btn">+ Ask a new question</button>
      </div>
      
      <div className="participants-section">
        <div className="participants-tabs">
          <button 
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button 
            className={`tab-button ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            Participants
          </button>
        </div>
        
        {activeTab === 'participants' ? (
          <div className="participants-list">
            <table className="participants-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(students).map(([studentId, student]) => (
                  <tr key={studentId}>
                    <td>{student.name}</td>
                    <td>
                      {student.hasAnswered ? (
                        <span className={`answer-status ${student.isCorrect === true ? 'correct' : student.isCorrect === false ? 'incorrect' : 'answered'}`}>
                          {student.isCorrect === true ? '✓ Correct' : 
                           student.isCorrect === false ? '✗ Incorrect' : 
                           '✓ Answered'}
                        </span>
                      ) : (
                        <span className="answer-status pending">Waiting...</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="kick-button"
                        onClick={() => handleKickStudent(studentId, student.name)}
                      >
                        Kick out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="chat-tab-content">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`message ${message.senderType}`}
                  >
                    <div className="message-header">
                      <span className="sender-name">{message.sender}</span>
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                    </div>
                    <div className="message-content">
                      {message.message}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                maxLength={500}
                disabled={!studentName && !isTeacher}
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() || (!studentName && !isTeacher)}
              >
                Send
              </button>
            </form>

            {!studentName && !isTeacher && (
              <div className="chat-disabled">
                <p>Register first to chat</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveResults;
