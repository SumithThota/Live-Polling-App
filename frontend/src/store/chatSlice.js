import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  isOpen: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    openChat: (state) => {
      state.isOpen = true;
    },
    clearMessages: (state) => {
      state.messages = [];
    }
  },
});

export const {
  addMessage,
  toggleChat,
  closeChat,
  openChat,
  clearMessages
} = chatSlice.actions;

export default chatSlice.reducer;
