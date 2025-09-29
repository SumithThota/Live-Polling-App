import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { pollAPI } from '../services/api';
import { setError, clearError } from '../store/pollSlice';
import './PollCreator.css';

const PollCreator = ({ canCreate, currentPoll }) => {
  const dispatch = useDispatch();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [timeLimit, setTimeLimit] = useState(60);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canCreate) {
      dispatch(setError('Cannot create poll: Previous poll is still active'));
      return;
    }

    const filledOptions = options.filter(option => option.trim() !== '');
    
    if (!question.trim()) {
      dispatch(setError('Question is required'));
      return;
    }
    
    if (filledOptions.length < 2) {
      dispatch(setError('At least 2 options are required'));
      return;
    }

    setIsLoading(true);
    dispatch(clearError());

    try {
      await pollAPI.createPoll({
        question: question.trim(),
        options: filledOptions,
        timeLimit,
        correctAnswer: correctAnswer || null
      });
      
      // Reset form
      setQuestion('');
      setOptions(['', '', '', '']);
      setTimeLimit(60);
      setCorrectAnswer('');
      
      
    } catch (error) {
      dispatch(setError(error.response?.data?.error || 'Failed to create poll'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="poll-creator">
      <div className="creator-header">
        <h2>Create New Poll</h2>
        {currentPoll && currentPoll.isActive && (
          <div className="active-poll-warning">
            <p>⚠️ A poll is currently active. Wait for all students to answer or for the timer to expire.</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="poll-form">
        <div className="form-group">
          <label htmlFor="question">Question *</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your poll question here..."
            rows={3}
            maxLength={500}
            disabled={!canCreate || isLoading}
            required
          />
          <small>{question.length}/500 characters</small>
        </div>

        <div className="form-group">
          <label>Answer Options * (Minimum 2 required)</label>
          <div className="options-list">
            {options.map((option, index) => (
              <div key={index} className="option-item">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={100}
                  disabled={!canCreate || isLoading}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="remove-option"
                    onClick={() => removeOption(index)}
                    disabled={!canCreate || isLoading}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {options.length < 10 && (
            <button
              type="button"
              className="add-option"
              onClick={addOption}
              disabled={!canCreate || isLoading}
            >
              + Add Option
            </button>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="correctAnswer">Correct Answer (Optional)</label>
          <select
            id="correctAnswer"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            disabled={!canCreate || isLoading}
          >
            <option value="">-- No correct answer --</option>
            {options.map((option, index) => (
              option.trim() && (
                <option key={index} value={option.trim()}>
                  {option.trim()}
                </option>
              )
            ))}
          </select>
          <small>Select this to track which students answered correctly</small>
        </div>

        <div className="form-group">
          <label htmlFor="timeLimit">Time Limit (seconds)</label>
          <input
            type="number"
            id="timeLimit"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Math.max(10, Math.min(300, e.target.value)))}
            min="10"
            max="300"
            disabled={!canCreate || isLoading}
          />
          <small>Between 10 and 300 seconds</small>
        </div>

        <button
          type="submit"
          className="create-poll-button"
          disabled={!canCreate || isLoading}
        >
          {isLoading ? 'Creating Poll...' : 'Create Poll'}
        </button>
      </form>
    </div>
  );
};

export default PollCreator;
