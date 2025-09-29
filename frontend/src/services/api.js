import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
