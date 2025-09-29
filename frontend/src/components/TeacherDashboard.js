import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { pollAPI } from '../services/api';
import { socketService } from '../services/socketService';
import { setPoll, updateResults, endPoll, setError, setPastPolls } from '../store/pollSlice';
import { updateStudents } from '../store/userSlice';
import PollCreator from './PollCreator';
import LiveResults from './LiveResults';
import StudentList from './StudentList';
import PastPolls from './PastPolls';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { currentPoll, results, pastPolls } = useSelector(state => state.poll);
  const { students } = useSelector(state => state.user);
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    // Set up socket listeners
    socketService.onTeacherRegistered(() => {
      console.log('Teacher registered');
    });

    socketService.onNewPoll((poll) => {
      dispatch(setPoll(poll));
    });

    socketService.onPollResults((results) => {
      dispatch(updateResults(results));
    });

    socketService.onPollEnded((data) => {
      dispatch(endPoll());
      loadPastPolls();
    });

    socketService.onStudentUpdate((students) => {
      dispatch(updateStudents(students));
    });

    // Load initial data
    loadCurrentState();
    loadPastPolls();

    return () => {
      socketService.off('teacherRegistered');
      socketService.off('newPoll');
      socketService.off('pollResults');
      socketService.off('pollEnded');
      socketService.off('studentUpdate');
    };
  }, [dispatch]);

  const loadCurrentState = async () => {
    try {
      const response = await pollAPI.getCurrentPoll();
      const { poll, results, students } = response.data;
      
      if (poll) {
        dispatch(setPoll(poll));
        dispatch(updateResults(results));
      }
      dispatch(updateStudents(students));
    } catch (error) {
      console.error('Error loading current state:', error);
      dispatch(setError('Failed to load current state'));
    }
  };

  const loadPastPolls = async () => {
    try {
      const response = await pollAPI.getPastPolls();
      dispatch(setPastPolls(response.data));
    } catch (error) {
      console.error('Error loading past polls:', error);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await pollAPI.removeStudent(studentId);
    } catch (error) {
      console.error('Error removing student:', error);
      dispatch(setError('Failed to remove student'));
    }
  };

  const canCreatePoll = () => {
    if (!currentPoll) return true;
    if (!currentPoll.isActive) return true;
    
    const studentCount = Object.keys(students).length;
    if (studentCount === 0) return true;
    
    const answeredCount = Object.values(students).filter(s => s.hasAnswered).length;
    return answeredCount === studentCount;
  };

  return (
    <div className="teacher-dashboard">
      <header className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            Live Session
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Past Polls
          </button>
        </div>
        <div className="header-actions">
          <span className="student-count">
            {Object.keys(students).length} Students Online
          </span>
        </div>
      </header>

      <main className="dashboard-content">
        {activeTab === 'live' && (
          <div className="main-layout">
            <div className="poll-section">
              <PollCreator 
                canCreate={canCreatePoll()}
                currentPoll={currentPoll}
              />
            </div>
            
            <div className="participants-section">
              <LiveResults 
                poll={currentPoll}
                results={results}
                students={students}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="history-layout">
            <PastPolls polls={pastPolls} />
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
