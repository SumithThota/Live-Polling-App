import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  studentId: null,
  studentName: '',
  isTeacher: false,
  isRegistered: false,
  hasAnswered: false,
  students: {},
  isKickedOut: false,
  kickReason: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    registerStudent: (state, action) => {
      state.studentId = action.payload.studentId;
      state.studentName = action.payload.name;
      state.isRegistered = true;
      state.isTeacher = false;
      state.hasAnswered = false;
    },
    registerTeacher: (state) => {
      state.isTeacher = true;
      state.isRegistered = true;
    },
    setAnswer: (state) => {
      state.hasAnswered = true;
    },
    updateStudents: (state, action) => {
      state.students = action.payload;
    },
    resetAnswer: (state) => {
      state.hasAnswered = false;
    },
    kickStudent: (state, action) => {
      state.isKickedOut = true;
      state.kickReason = action.payload.reason || 'You have been removed from the session.';
      state.isRegistered = false;
    },
    logout: (state) => {
      state.studentId = null;
      state.studentName = '';
      state.isTeacher = false;
      state.isRegistered = false;
      state.hasAnswered = false;
      state.students = {};
      state.isKickedOut = false;
      state.kickReason = '';
    }
  },
});

export const {
  registerStudent,
  registerTeacher,
  setAnswer,
  updateStudents,
  resetAnswer,
  kickStudent,
  logout
} = userSlice.actions;

export default userSlice.reducer;
