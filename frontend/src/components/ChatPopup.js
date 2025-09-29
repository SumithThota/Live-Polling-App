import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { socketService } from '../services/socketService';
import { addMessage, closeChat } from '../store/chatSlice';
import './ChatPopup.css';

const ChatPopup = () => {
  const dispatch = useDispatch();
  const { isOpen, messages } = useSelector(state => state.chat);
  const { studentName, isTeacher } = useSelector(state => state.user);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      socketService.onNewMessage((message) => {
        dispatch(addMessage(message));
      });
    }

    return () => {
      socketService.off('newMessage');
    };
  }, [dispatch, isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="chat-popup">
      <div className="chat-header">
        <h3>💬 Live Chat</h3>
        <button 
          className="close-chat"
          onClick={() => dispatch(closeChat())}
        >
          ✕
        </button>
      </div>

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
  );
};

export default ChatPopup;
