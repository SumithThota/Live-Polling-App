import React from 'react';
import './StudentList.css';

const StudentList = ({ students, onRemoveStudent }) => {
  const studentList = Object.entries(students);
  
  if (studentList.length === 0) {
    return (
      <div className="student-list">
        <div className="no-students">
          <h2>No Students Online</h2>
          <p>Students will appear here when they join the session.</p>
        </div>
      </div>
    );
  }

  const answeredCount = studentList.filter(([_, student]) => student.hasAnswered).length;

  return (
    <div className="student-list">
      <div className="list-header">
        <h2>Connected Students</h2>
        <div className="student-stats">
          <span>{studentList.length} total</span>
          <span>•</span>
          <span>{answeredCount} answered</span>
        </div>
      </div>

      <div className="students-grid">
        {studentList.map(([studentId, student]) => (
          <div 
            key={studentId} 
            className={`student-card ${student.hasAnswered ? 'answered' : 'pending'}`}
          >
            <div className="student-info">
              <div className="student-avatar">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="student-details">
                <h4>{student.name}</h4>
                <small>ID: {studentId.slice(-8)}</small>
              </div>
            </div>
            
            <div className="student-status">
              <span className={`status-badge ${student.hasAnswered ? 'answered' : 'waiting'}`}>
                {student.hasAnswered ? '✅ Answered' : '⏳ Waiting'}
              </span>
            </div>
            
            <div className="student-actions">
              <button 
                className="remove-button"
                onClick={() => onRemoveStudent(studentId)}
                title="Remove student"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="list-summary">
        <p>
          {answeredCount} of {studentList.length} students have answered the current poll
        </p>
      </div>
    </div>
  );
};

export default StudentList;
