const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Enhanced Socket.IO configuration for better performance and responsiveness
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000, // Increase ping timeout for slower connections
  pingInterval: 25000, // Reduce ping interval for better connection monitoring
  maxHttpBufferSize: 1e6, // 1MB max message size
  allowEIO3: true, // Allow Engine.IO v3 clients
  transports: ['polling', 'websocket'], // Support both transport methods
  upgradeTimeout: 30000, // Time to wait for upgrade
  httpCompression: true, // Enable compression
  perMessageDeflate: true // Enable per-message compression
});

// Enhanced middleware with performance optimizations
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increase JSON payload limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory storage (in production, use a database)
let currentPoll = null;
let students = new Map(); // studentId -> { name, socketId, hasAnswered }
let pollResults = new Map(); // option -> count
let pastPolls = []; // Store past poll results
let pollTimer = null;
let pollTimeLimit = 60; // seconds
const MAX_STUDENTS = 100; // Maximum number of students allowed

// Performance monitoring and connection management
const connectionStats = {
  totalConnections: 0,
  activeConnections: 0,
  peakConnections: 0,
  startTime: new Date().toISOString(),
  pollsCreated: 0,
  messagesProcessed: 0
};

// Connection rate limiting per IP
const connectionLimiter = new Map(); // IP -> { count, lastReset }
const MAX_CONNECTIONS_PER_IP = 10;
const CONNECTION_WINDOW = 60000; // 1 minute window

// Cleanup intervals for better memory management
const CLEANUP_INTERVAL = 300000; // 5 minutes
const INACTIVE_TIMEOUT = 1800000; // 30 minutes

// Auto-cleanup function to prevent memory leaks
function performCleanup() {
  const now = Date.now();
  
  // Clean up connection limiter
  for (const [ip, data] of connectionLimiter.entries()) {
    if (now - data.lastReset > CONNECTION_WINDOW) {
      connectionLimiter.delete(ip);
    }
  }
  
  // Keep only last 50 past polls to prevent memory bloat
  if (pastPolls.length > 50) {
    pastPolls = pastPolls.slice(-50);
  }
  
  console.log(`Cleanup performed. Active connections: ${connectionStats.activeConnections}, Past polls: ${pastPolls.length}`);
}

// Set up cleanup interval
setInterval(performCleanup, CLEANUP_INTERVAL);

// Rate limiting middleware
function rateLimiter(maxRequests = 30, windowMs = 60000) {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const requestData = requests.get(ip);
    
    if (now > requestData.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (requestData.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
      });
    }
    
    requestData.count++;
    next();
  };
}

// Apply rate limiting to all routes
app.use(rateLimiter());

// Routes

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    connections: {
      active: connectionStats.activeConnections,
      peak: connectionStats.peakConnections,
      total: connectionStats.totalConnections
    },
    polls: {
      active: currentPoll ? 1 : 0,
      completed: pastPolls.length,
      created: connectionStats.pollsCreated
    },
    students: students.size,
    timestamp: new Date().toISOString()
  });
});

// Server statistics endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    ...connectionStats,
    studentsCount: students.size,
    activePoll: currentPoll !== null,
    pastPollsCount: pastPolls.length
  });
});

app.get('/api/current-poll', (req, res) => {
  res.json({
    poll: currentPoll,
    results: Object.fromEntries(pollResults),
    students: Object.fromEntries(students)
  });
});

app.post('/api/create-poll', rateLimiter(5, 60000), (req, res) => { // Stricter rate limiting for poll creation
  const { question, options, timeLimit = 60, correctAnswer } = req.body;
  
  // Enhanced validation
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'Valid question is required' });
  }
  
  if (question.length > 500) {
    return res.status(400).json({ error: 'Question too long. Maximum 500 characters.' });
  }
  
  if (!options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'At least 2 options are required' });
  }
  
  if (options.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 options allowed' });
  }
  
  // Validate each option
  for (let i = 0; i < options.length; i++) {
    if (!options[i] || typeof options[i] !== 'string' || options[i].trim().length === 0) {
      return res.status(400).json({ error: `Option ${i + 1} is invalid` });
    }
    if (options[i].length > 200) {
      return res.status(400).json({ error: `Option ${i + 1} too long. Maximum 200 characters.` });
    }
  }
  
  // Validate time limit
  if (timeLimit < 10 || timeLimit > 600) {
    return res.status(400).json({ error: 'Time limit must be between 10 and 600 seconds' });
  }

  // Validate correct answer if provided
  if (correctAnswer && !options.includes(correctAnswer)) {
    return res.status(400).json({ error: 'Correct answer must be one of the provided options' });
  }

  // Check if previous poll is complete
  const allStudentsAnswered = Array.from(students.values()).every(student => student.hasAnswered);
  if (currentPoll && !allStudentsAnswered && students.size > 0) {
    return res.status(400).json({ error: 'Previous poll is still active' });
  }

  // Create new poll
  currentPoll = {
    id: uuidv4(),
    question: question.trim(),
    options: options.map(opt => opt.trim()),
    correctAnswer: correctAnswer || null,
    createdAt: new Date().toISOString(),
    isActive: true,
    timeLimit,
    createdBy: req.ip || 'unknown' // Track poll creator
  };

  // Update statistics
  connectionStats.pollsCreated++;
  
  console.log(`New poll created: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}" with ${options.length} options, ${timeLimit}s duration`);

  // Reset poll data
  pollResults.clear();
  options.forEach(option => pollResults.set(option, 0));
  
  // Reset student answered status and clear previous answers
  students.forEach(student => {
    student.hasAnswered = false;
    student.answer = null;
    student.isCorrect = null;
  });

  pollTimeLimit = timeLimit;

  // Start poll timer
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = setTimeout(() => {
    endPoll();
  }, timeLimit * 1000);

  // Broadcast new poll to all clients
  io.emit('newPoll', currentPoll);
  io.emit('pollResults', Object.fromEntries(pollResults));

  res.json(currentPoll);
});

app.post('/api/submit-answer', (req, res) => {
  const { studentId, answer } = req.body;
  
  if (!currentPoll || !currentPoll.isActive) {
    return res.status(400).json({ error: 'No active poll' });
  }

  if (!students.has(studentId)) {
    return res.status(400).json({ error: 'Student not registered' });
  }

  const student = students.get(studentId);
  if (student.hasAnswered) {
    return res.status(400).json({ error: 'Already answered' });
  }

  if (!currentPoll.options.includes(answer)) {
    return res.status(400).json({ error: 'Invalid answer option' });
  }

  // Record answer and check correctness
  student.hasAnswered = true;
  student.answer = answer;
  student.isCorrect = currentPoll.correctAnswer ? answer === currentPoll.correctAnswer : null;
  
  pollResults.set(answer, pollResults.get(answer) + 1);

  // Broadcast updated results
  io.emit('pollResults', Object.fromEntries(pollResults));
  io.emit('studentUpdate', Object.fromEntries(students));

  // Check if all students have answered
  const allAnswered = Array.from(students.values()).every(s => s.hasAnswered);
  if (allAnswered && students.size > 0) {
    endPoll();
  }

  res.json({ success: true });
});

app.get('/api/past-polls', (req, res) => {
  res.json(pastPolls);
});

app.get('/api/students-count', (req, res) => {
  res.json({
    count: students.size,
    maxStudents: MAX_STUDENTS,
    students: Array.from(students.values()).map(student => ({
      name: student.name,
      joinedAt: student.joinedAt,
      hasAnswered: student.hasAnswered
    }))
  });
});

app.delete('/api/remove-student/:studentId', (req, res) => {
  const { studentId } = req.params;
  
  if (students.has(studentId)) {
    const student = students.get(studentId);
    
    // Notify the specific student they've been kicked out
    io.sockets.sockets.forEach(socket => {
      if (socket.id === student.socketId) {
        socket.emit('studentKicked', {
          reason: 'You have been removed from the poll system by the teacher.'
        });
        socket.disconnect(true);
      }
    });
    
    students.delete(studentId);
    
    // Notify all other clients about student removal
    io.emit('studentRemoved', studentId);
    io.emit('studentUpdate', Object.fromEntries(students));
    
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

function endPoll() {
  if (!currentPoll) return;
  
  currentPoll.isActive = false;
  currentPoll.endedAt = new Date().toISOString();
  
  // Calculate correctness statistics
  const studentsArray = Array.from(students.values());
  const answeredStudents = studentsArray.filter(s => s.hasAnswered);
  const correctAnswers = currentPoll.correctAnswer ? 
    answeredStudents.filter(s => s.isCorrect).length : 0;
  
  // Prepare student answers for analytics
  const studentAnswers = answeredStudents.map(student => ({
    studentId: student.name, // Using name for display
    answer: student.answer,
    isCorrect: student.isCorrect
  }));
  
  // Store poll in past polls
  pastPolls.push({
    ...currentPoll,
    results: Object.fromEntries(pollResults),
    totalStudents: students.size,
    answeredStudents: answeredStudents.length,
    correctAnswers: correctAnswers,
    accuracyRate: answeredStudents.length > 0 ? 
      Math.round((correctAnswers / answeredStudents.length) * 100) : 0,
    studentAnswers: studentAnswers
  });
  
  console.log('Stored poll in past polls:', {
    question: currentPoll.question,
    correctAnswer: currentPoll.correctAnswer,
    studentAnswers: studentAnswers,
    correctCount: correctAnswers
  });
  
  // Clear timer
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
  
  // Broadcast poll end and then clear current poll
  io.emit('pollEnded', {
    poll: currentPoll,
    results: Object.fromEntries(pollResults)
  });
  
  // Clear current poll so students go back to waiting state
  currentPoll = null;
  pollResults.clear();
  
  // Send null poll to all students to show waiting state
  io.emit('newPoll', null);
}

// Enhanced Socket.io connection handling with performance monitoring
io.on('connection', (socket) => {
  const clientIP = socket.handshake.address;
  const connectionTime = Date.now();
  
  // Update connection statistics
  connectionStats.totalConnections++;
  connectionStats.activeConnections++;
  if (connectionStats.activeConnections > connectionStats.peakConnections) {
    connectionStats.peakConnections = connectionStats.activeConnections;
  }
  
  // Rate limiting per IP
  if (!connectionLimiter.has(clientIP)) {
    connectionLimiter.set(clientIP, { count: 1, lastReset: Date.now() });
  } else {
    const limiterData = connectionLimiter.get(clientIP);
    if (Date.now() - limiterData.lastReset > CONNECTION_WINDOW) {
      limiterData.count = 1;
      limiterData.lastReset = Date.now();
    } else {
      limiterData.count++;
      if (limiterData.count > MAX_CONNECTIONS_PER_IP) {
        console.log(`Rate limit exceeded for IP: ${clientIP}`);
        socket.emit('connectionError', { 
          error: 'Too many connections from your IP. Please try again later.' 
        });
        socket.disconnect(true);
        connectionStats.activeConnections--;
        return;
      }
    }
  }
  
  console.log(`User connected: ${socket.id} from ${clientIP} (Active: ${connectionStats.activeConnections})`);
  
  // Set up socket timeout for inactive connections (using timer instead of setTimeout)
  const inactivityTimer = setTimeout(() => {
    console.log(`Disconnecting inactive socket: ${socket.id}`);
    socket.emit('connectionError', { error: 'Connection timed out due to inactivity' });
    socket.disconnect(true);
  }, INACTIVE_TIMEOUT);
  
  // Clear timer on any socket activity
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
  };
  
  socket.on('registerStudent', resetInactivityTimer);
  socket.on('sendMessage', resetInactivityTimer);
  socket.on('disconnect', () => {
    clearTimeout(inactivityTimer);
  });
  
  // Enhanced error handling
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
  
  socket.on('disconnect', (reason) => {
    connectionStats.activeConnections--;
    console.log(`User disconnected: ${socket.id} (Reason: ${reason}, Active: ${connectionStats.activeConnections})`);
    
    // Clean up student data
    for (let [studentId, student] of students.entries()) {
      if (student.socketId === socket.id) {
        console.log(`Removing student: ${student.name} (ID: ${studentId})`);
        students.delete(studentId);
        console.log(`Students remaining: ${students.size}`);
        io.emit('studentUpdate', Object.fromEntries(students));
        break;
      }
    }
  });

  // Register student
  socket.on('registerStudent', (data) => {
    const { name } = data;
    
    console.log(`Student registration attempt: ${name}`);
    console.log(`Current students count: ${students.size}/${MAX_STUDENTS}`);
    
    // Check if maximum students limit reached
    if (students.size >= MAX_STUDENTS) {
      console.log('Registration rejected: Session full');
      socket.emit('registrationError', { 
        error: `Session is full. Maximum ${MAX_STUDENTS} students allowed.` 
      });
      return;
    }
    
    // Check if student with same socket is already registered
    for (let [existingId, student] of students.entries()) {
      if (student.socketId === socket.id) {
        console.log('Student already registered with this socket, updating...');
        socket.emit('studentRegistered', { studentId: existingId, name: student.name });
        
        // Also send current poll state
        if (currentPoll && currentPoll.isActive) {
          console.log(`Resending active poll to returning student ${student.name}`);
          socket.emit('newPoll', currentPoll);
          socket.emit('pollResults', Object.fromEntries(pollResults));
        } else {
          console.log(`Resending null poll (waiting state) to returning student ${student.name}`);
          socket.emit('newPoll', null);
        }
        return;
      }
    }
    
    // Check if student name is already taken
    for (let [existingId, student] of students.entries()) {
      if (student.name.toLowerCase() === name.toLowerCase()) {
        console.log(`Registration rejected: Name ${name} already taken`);
        socket.emit('registrationError', { 
          error: `The name "${name}" is already taken. Please choose a different name.` 
        });
        return;
      }
    }
    
    const studentId = uuidv4();
    
    students.set(studentId, {
      name,
      socketId: socket.id,
      hasAnswered: false,
      joinedAt: new Date().toISOString()
    });

    console.log(`Student registered: ${name} (ID: ${studentId})`);
    console.log(`Total students now: ${students.size}`);

    socket.emit('studentRegistered', { studentId, name });
    io.emit('studentUpdate', Object.fromEntries(students));
    
    // Always send current poll state to the newly registered student
    if (currentPoll && currentPoll.isActive) {
      // Send active poll
      console.log(`Sending active poll to student ${name}`);
      socket.emit('newPoll', currentPoll);
      socket.emit('pollResults', Object.fromEntries(pollResults));
    } else {
      // Send null poll to ensure student sees waiting state
      console.log(`Sending null poll (waiting state) to student ${name}`);
      socket.emit('newPoll', null);
    }
  });

  // Register teacher
  socket.on('registerTeacher', () => {
    socket.emit('teacherRegistered');
    
    // Send current state
    socket.emit('studentUpdate', Object.fromEntries(students));
    if (currentPoll && currentPoll.isActive) {
      socket.emit('newPoll', currentPoll);
      socket.emit('pollResults', Object.fromEntries(pollResults));
    } else {
      socket.emit('newPoll', null);
    }
  });

  // Enhanced chat message handling with spam protection
  const messageHistory = new Map(); // Track message frequency per socket
  const MAX_MESSAGES_PER_MINUTE = 10;
  const MESSAGE_WINDOW = 60000; // 1 minute
  const MAX_MESSAGE_LENGTH = 500;
  
  socket.on('sendMessage', (data) => {
    const { message, sender, senderType } = data;
    const now = Date.now();
    
    // Validate input
    if (!message || !sender || !senderType) {
      console.error('Invalid message data:', data);
      socket.emit('messageError', { error: 'Invalid message format' });
      return;
    }
    
    // Check message length
    if (message.trim().length === 0) {
      socket.emit('messageError', { error: 'Message cannot be empty' });
      return;
    }
    
    if (message.length > MAX_MESSAGE_LENGTH) {
      socket.emit('messageError', { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` });
      return;
    }
    
    // Spam protection
    if (!messageHistory.has(socket.id)) {
      messageHistory.set(socket.id, { messages: [now], lastReset: now });
    } else {
      const history = messageHistory.get(socket.id);
      
      // Reset counter if window expired
      if (now - history.lastReset > MESSAGE_WINDOW) {
        history.messages = [now];
        history.lastReset = now;
      } else {
        // Remove old messages from history
        history.messages = history.messages.filter(timestamp => now - timestamp < MESSAGE_WINDOW);
        
        // Check rate limit
        if (history.messages.length >= MAX_MESSAGES_PER_MINUTE) {
          socket.emit('messageError', { 
            error: 'Too many messages. Please slow down.',
            retryAfter: Math.ceil((MESSAGE_WINDOW - (now - history.messages[0])) / 1000)
          });
          return;
        }
        
        history.messages.push(now);
      }
    }

    const messageData = {
      id: uuidv4(),
      message: message.trim(),
      sender: sender.substring(0, 50), // Limit sender name length
      senderType,
      timestamp: new Date().toISOString()
    };

    // Update stats
    connectionStats.messagesProcessed++;

    // Broadcast message to all connected clients
    io.emit('newMessage', messageData);
    console.log(`New message from ${sender} (${senderType}): ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove student if they disconnect
    for (let [studentId, student] of students.entries()) {
      if (student.socketId === socket.id) {
        console.log(`Removing student: ${student.name} (ID: ${studentId})`);
        students.delete(studentId);
        io.emit('studentUpdate', Object.fromEntries(students));
        console.log(`Students remaining: ${students.size}`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5002;

// Enhanced server startup with better error handling
server.listen(PORT, () => {
  console.log(`🚀 Polling Server started successfully!`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🎯 Max students allowed: ${MAX_STUDENTS}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📈 Statistics: http://localhost:${PORT}/api/stats`);
});

// Enhanced error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please close other instances or use a different port.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
  }
});

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log('\n🔄 Received shutdown signal. Starting graceful shutdown...');
  
  // Stop accepting new connections
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('📊 Final Statistics:');
    console.log(`   Total connections: ${connectionStats.totalConnections}`);
    console.log(`   Peak connections: ${connectionStats.peakConnections}`);
    console.log(`   Polls created: ${connectionStats.pollsCreated}`);
    console.log(`   Messages processed: ${connectionStats.messagesProcessed}`);
    console.log(`   Active students: ${students.size}`);
    console.log(`   Past polls: ${pastPolls.length}`);
    
    console.log('✅ Server shutdown completed gracefully');
    process.exit(0);
  });
  
  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    console.error('⏰ Graceful shutdown timeout. Forcing exit...');
    process.exit(1);
  }, 10000); // 10 seconds timeout
};

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);  // Ctrl+C
process.on('SIGTERM', gracefulShutdown); // Termination signal
process.on('SIGUSR2', gracefulShutdown); // Nodemon restart

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});
