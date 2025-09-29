import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    // Use environment variable for socket URL, fallback to localhost for development
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5002';
    console.log('Socket URL:', SOCKET_URL); // For debugging deployment
    
    this.socket = io(SOCKET_URL, {
      withCredentials: true, // Enable credentials for CORS
      transports: ['polling', 'websocket'], // Support both transport methods
      upgrade: true,
      rememberUpgrade: true
    });
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Student registration
  registerStudent(name) {
    if (this.socket) {
      this.socket.emit('registerStudent', { name });
    }
  }

  // Teacher registration
  registerTeacher() {
    if (this.socket) {
      this.socket.emit('registerTeacher');
    }
  }

  // Send chat message
  sendMessage(message, sender, senderType) {
    if (this.socket) {
      this.socket.emit('sendMessage', { message, sender, senderType });
    }
  }

  // Event listeners
  onStudentRegistered(callback) {
    if (this.socket) {
      this.socket.on('studentRegistered', callback);
    }
  }

  onRegistrationError(callback) {
    if (this.socket) {
      this.socket.on('registrationError', callback);
    }
  }

  onTeacherRegistered(callback) {
    if (this.socket) {
      this.socket.on('teacherRegistered', callback);
    }
  }

  onNewPoll(callback) {
    if (this.socket) {
      this.socket.on('newPoll', callback);
    }
  }

  onPollResults(callback) {
    if (this.socket) {
      this.socket.on('pollResults', callback);
    }
  }

  onPollEnded(callback) {
    if (this.socket) {
      this.socket.on('pollEnded', callback);
    }
  }

  onStudentUpdate(callback) {
    if (this.socket) {
      this.socket.on('studentUpdate', callback);
    }
  }

  onStudentRemoved(callback) {
    if (this.socket) {
      this.socket.on('studentRemoved', callback);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  onStudentKicked(callback) {
    if (this.socket) {
      this.socket.on('studentKicked', callback);
    }
  }

  // Remove event listeners
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();
