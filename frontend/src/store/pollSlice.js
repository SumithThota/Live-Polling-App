import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPoll: null,
  results: {},
  isLoading: false,
  error: null,
  timeRemaining: 0,
  pastPolls: [],
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setPoll: (state, action) => {
      state.currentPoll = action.payload;
      state.timeRemaining = action.payload?.timeLimit || 60;
    },
    updateResults: (state, action) => {
      state.results = action.payload;
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    decrementTime: (state) => {
      if (state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },
    endPoll: (state) => {
      if (state.currentPoll) {
        state.currentPoll.isActive = false;
      }
      state.timeRemaining = 0;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPastPolls: (state, action) => {
      state.pastPolls = action.payload;
    },
    clearPoll: (state) => {
      state.currentPoll = null;
      state.results = {};
      state.timeRemaining = 0;
    }
  },
});

export const {
  setPoll,
  updateResults,
  setTimeRemaining,
  decrementTime,
  endPoll,
  setLoading,
  setError,
  clearError,
  setPastPolls,
  clearPoll
} = pollSlice.actions;

export default pollSlice.reducer;
