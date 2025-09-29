import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { pollAPI } from '../services/api';
import { socketService } from '../services/socketService';
import { registerStudent, setAnswer, resetAnswer, kickStudent } from '../store/userSlice';
import { setPoll, updateResults, decrementTime, endPoll, clearPoll } from '../store/pollSlice';
import StudentNameForm from './StudentNameForm';
import PollQuestion from './PollQuestion';
import PollResults from './PollResults';
import Timer from './Timer';
import KickedOut from './KickedOut';
import './StudentInterface.css';

const StudentInterface = () => {
  const dispatch = useDispatch();
  const { studentId, studentName, isRegistered, hasAnswered, isKickedOut, kickReason } = useSelector(state => state.user);
  const { currentPoll, results, timeRemaining } = useSelector(state => state.poll);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure socket connection and event listeners on mount
  useEffect(() => {
    socketService.connect();
    
    // Set up socket listeners immediately after connection
    socketService.onStudentRegistered((data) => {
      console.log('Student registered event received:', data);
      dispatch(registerStudent(data));
    });

    socketService.onRegistrationError((data) => {
      alert(data.error); // Show error to user
      console.error('Registration failed:', data.error);
    });

    socketService.onNewPoll((poll) => {
      console.log('New poll event received:', poll);
      if (poll === null) {
        dispatch(clearPoll());
      } else {
        dispatch(setPoll(poll));
      }
      dispatch(resetAnswer());
    });

    socketService.onPollResults((results) => {
      dispatch(updateResults(results));
    });

    socketService.onPollEnded((data) => {
      dispatch(endPoll());
      // After poll ends, clear it to show waiting state
      setTimeout(() => {
        dispatch(clearPoll());
      }, 3000); // Give 3 seconds to show results before going back to waiting
    });

    socketService.onStudentKicked((data) => {
      dispatch(kickStudent(data));
    });

    return () => {
      socketService.off('studentRegistered');
      socketService.off('registrationError');
      socketService.off('newPoll');
      socketService.off('pollResults');
      socketService.off('pollEnded');
      socketService.off('studentKicked');
    };
  }, [dispatch]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (currentPoll && currentPoll.isActive && timeRemaining > 0 && !hasAnswered) {
      interval = setInterval(() => {
        dispatch(decrementTime());
      }, 1000);
    } else if (timeRemaining === 0 && currentPoll && currentPoll.isActive) {
      dispatch(endPoll());
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentPoll, timeRemaining, hasAnswered, dispatch]);

  const handleNameSubmit = async (name) => {
    try {
      socketService.registerStudent(name);
    } catch (error) {
      console.error('Error registering student:', error);
    }
  };

  const handleAnswerSubmit = async (selectedOption) => {
    if (!studentId || !currentPoll || hasAnswered) return;

    setIsSubmitting(true);
    
    try {
      await pollAPI.submitAnswer(studentId, selectedOption);
      dispatch(setAnswer());
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAnswer = currentPoll && 
                   currentPoll.isActive && 
                   !hasAnswered && 
                   timeRemaining > 0 && 
                   isRegistered;

  const showResults = hasAnswered || 
                     !currentPoll?.isActive || 
                     timeRemaining === 0;

  if (isKickedOut) {
    return <KickedOut reason={kickReason} />;
  }

  if (!isRegistered) {
    return <StudentNameForm onSubmit={handleNameSubmit} />;
  }

  return (
    <div className="student-interface">
      <header className="student-header">
        <div className="student-info">
          <h1>Welcome, {studentName}!</h1>
          <span className="student-id">ID: {studentId?.slice(-8)}</span>
        </div>
      </header>

      <main className="student-content">
        {!currentPoll && (
          <div className="waiting-state">
            <div className="logo">✨ Intervue Poll</div>
            <div className="loading-spinner"></div>
            <h2>Wait for the teacher to ask questions..</h2>
          </div>
        )}

        {currentPoll && (
          <div className="poll-section">
            <div className="poll-header">
              <h2>Poll Question</h2>
              {currentPoll.isActive && (
                <Timer 
                  timeRemaining={timeRemaining} 
                  totalTime={currentPoll.timeLimit || 60}
                />
              )}
            </div>

            {canAnswer && (
              <PollQuestion
                poll={currentPoll}
                onSubmit={handleAnswerSubmit}
                isSubmitting={isSubmitting}
              />
            )}

            {showResults && (
              <PollResults
                poll={currentPoll}
                results={results}
                hasAnswered={hasAnswered}
                timeUp={timeRemaining === 0}
              />
            )}

            {hasAnswered && currentPoll.isActive && (
              <div className="answer-submitted">
                <div className="success-icon">✅</div>
                <p>Your answer has been submitted!</p>
                <small>Waiting for other students or timer to expire...</small>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentInterface;
