import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:5002/api';

console.log('API Base URL:', API_BASE_URL); // For debugging deployment

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS
});

export const pollAPI = {
  // Get current poll and results
  getCurrentPoll: () => api.get('/current-poll'),

  // Create new poll (teacher only)
  createPoll: (pollData) => api.post('/create-poll', pollData),

  // Submit answer (student only)
  submitAnswer: (studentId, answer) => 
    api.post('/submit-answer', { studentId, answer }),

  // Get past polls (teacher only)
  getPastPolls: () => api.get('/past-polls'),

  // Remove student (teacher only)
  removeStudent: (studentId) => api.delete(`/remove-student/${studentId}`),
};

export default api;
