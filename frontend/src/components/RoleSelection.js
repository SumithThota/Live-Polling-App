import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerTeacher } from '../store/userSlice';
import { socketService } from '../services/socketService';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedPersona, setSelectedPersona] = useState(null);

  const selectPersona = (persona) => {
    setSelectedPersona(persona);
  };

  const continueToApp = () => {
    if (!selectedPersona) return;

    if (selectedPersona === 'teacher') {
      dispatch(registerTeacher());
      socketService.registerTeacher();
      navigate('/teacher');
    } else {
      navigate('/student');
    }
  };

  return (
    <div className="container">
      {/* Header with Logo */}
      <div className="header">
        <div className="logo">Intervue Poll</div>
      </div>

      {/* Welcome Screen */}
      <div id="welcome-screen">
        <div className="header">
          <h1 className="welcome-title">Welcome to the <strong>Live Polling System</strong></h1>
          <p className="welcome-subtitle">Please select the role that best describes you to begin using the live polling system</p>
        </div>

        <div className="persona-selection">
          <div 
            className={`persona-card ${selectedPersona === 'student' ? 'selected' : ''}`}
            onClick={() => selectPersona('student')}
            data-persona="student"
          >
            <h3>I'm a Student</h3>
            <p>Answer the poll immediately after teacher creates it.</p>
          </div>
          <div 
            className={`persona-card ${selectedPersona === 'teacher' ? 'selected' : ''}`}
            onClick={() => selectPersona('teacher')}
            data-persona="teacher"
          >
            <h3>I'm a Teacher</h3>
            <p>create new polls and can view live poll results in real-time of all the students.</p>
          </div>
        </div>

        <button 
          className="continue-btn" 
          disabled={!selectedPersona} 
          onClick={continueToApp}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
