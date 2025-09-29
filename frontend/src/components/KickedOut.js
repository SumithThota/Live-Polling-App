import React from 'react';
import './KickedOut.css';

const KickedOut = ({ reason }) => {
  const handleTryAgain = () => {
    window.location.reload();
  };

  return (
    <div className="kicked-out-container">
      <div className="kicked-out-content">
        <div className="logo">
          ✨ Intervue Poll
        </div>
        
        <div className="kicked-out-message">
          <h1>You've been Kicked out !</h1>
          <p className="reason">
            {reason || "Looks like the teacher had removed you from the poll system. Please try again sometime."}
          </p>
        </div>
        
        <button 
          className="try-again-button"
          onClick={handleTryAgain}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default KickedOut;