import React, { useState } from 'react';
import './PollQuestion.css';

const PollQuestion = ({ poll, onSubmit, isSubmitting }) => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOption && !isSubmitting) {
      onSubmit(selectedOption);
    }
  };

  return (
    <div className="poll-question">
      <div className="question-text">
        <h3>{poll.question}</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="options-form">
        <div className="options-list">
          {poll.options.map((option, index) => (
            <label 
              key={index} 
              className={`option-item ${selectedOption === option ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="pollOption"
                value={option}
                checked={selectedOption === option}
                onChange={(e) => setSelectedOption(e.target.value)}
                disabled={isSubmitting}
              />
              <span className="option-text">{option}</span>
              <span className="radio-custom"></span>
            </label>
          ))}
        </div>
        
        <button 
          type="submit" 
          className="submit-answer-button"
          disabled={!selectedOption || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
};

export default PollQuestion;
