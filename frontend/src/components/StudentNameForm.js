import React, { useState } from 'react';
import './StudentNameForm.css';

const StudentNameForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    await onSubmit(name.trim());
    setIsSubmitting(false);
  };

  return (
    <div className="student-name-form">
      <div className="form-container">
        <div className="form-header">
          <h1>Welcome to Live Polling</h1>
          <p>Please enter your name to join the session</p>
        </div>
        
        <form onSubmit={handleSubmit} className="name-form">
          <div className="input-group">
            <label htmlFor="studentName">Your Name</label>
            <input
              type="text"
              id="studentName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
              disabled={isSubmitting}
              required
              autoFocus
            />
          </div>
          
          <button 
            type="submit" 
            className="join-button"
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? 'Joining...' : 'Join Session'}
          </button>
        </form>
        
        <div className="form-footer">
          <small>Your name will be visible to the teacher and other students</small>
        </div>
      </div>
    </div>
  );
};

export default StudentNameForm;
