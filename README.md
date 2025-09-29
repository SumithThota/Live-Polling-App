# Live Polling Application

A real-time polling application built with React and Express.js featuring teacher and student interfaces with live updates via Socket.io.

🌐 **[Live Demo](https://live-polling-frontend.onrender.com)** | 📖 **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**

## Features

### Teacher Features
- ✅ Create new polls with multiple choice questions
- ✅ View live polling results with real-time updates
- ✅ Manage students (view list and remove students)
- ✅ View past poll results and history
- ✅ Configurable poll time limit (10-300 seconds)
- ✅ Chat functionality with students
- ✅ Automatic poll ending when all students answer or timer expires
- ✅ Correct answer tracking and winner display
- ✅ Student kick-out functionality

### Student Features
- ✅ Enter unique name on first visit
- ✅ Submit answers to active polls
- ✅ View live results after submission
- ✅ 60-second (configurable) timer for answering
- ✅ Real-time chat with teacher and other students
- ✅ Automatic results display when time expires
- ✅ Responsive mobile interface
- ✅ Graceful handling when kicked out

### Technical Features
- ✅ Real-time updates using Socket.io
- ✅ Redux state management
- ✅ Responsive mobile-friendly design
- ✅ Professional UI with modern styling
- ✅ Error handling and validation
- ✅ Persistent connection management
- ✅ Rate limiting and spam protection
- ✅ Performance monitoring and health checks
- ✅ Production-ready deployment configuration

## Technology Stack

- **Frontend**: React 18, Redux Toolkit, React Router
- **Backend**: Node.js, Express.js, Socket.io
- **Styling**: CSS3 with modern responsive design
- **Real-time**: Socket.io for live updates
- **State Management**: Redux with RTK

## Project Structure

```
live-polling-app/
├── backend/
│   ├── package.json
│   └── server.js
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── ChatPopup.js/css
        │   ├── LiveResults.js/css
        │   ├── PastPolls.js/css
        │   ├── PollCreator.js/css
        │   ├── PollQuestion.js/css
        │   ├── PollResults.js/css
        │   ├── RoleSelection.js/css
        │   ├── StudentInterface.js/css
        │   ├── StudentList.js/css
        │   ├── StudentNameForm.js/css
        │   ├── TeacherDashboard.js/css
        │   └── Timer.js/css
        ├── services/
        │   ├── api.js
        │   └── socketService.js
        ├── store/
        │   ├── index.js
        │   ├── pollSlice.js
        │   ├── userSlice.js
        │   └── chatSlice.js
        ├── App.js/css
        └── index.js
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## Usage

1. **Access the Application**: Open `http://localhost:3000` in your browser

2. **Select Role**: Choose either "Teacher" or "Student"

3. **Teacher Flow**:
   - Create polls with questions and multiple choice answers
   - Set custom time limits (10-300 seconds)
   - Monitor live results and student participation
   - Chat with students
   - View past poll history
   - Remove students if needed

4. **Student Flow**:
   - Enter your name to join the session
   - Wait for teacher to create a poll
   - Answer within the time limit
   - View results after submission or when time expires
   - Participate in chat discussions

## API Endpoints

### REST API
- `GET /api/current-poll` - Get current poll and results
- `POST /api/create-poll` - Create a new poll (teacher only)
- `POST /api/submit-answer` - Submit poll answer (student only)
- `GET /api/past-polls` - Get poll history (teacher only)
- `DELETE /api/remove-student/:studentId` - Remove student (teacher only)

### Socket.io Events
- `registerStudent` - Student joins session
- `registerTeacher` - Teacher joins session
- `newPoll` - Broadcast new poll to all clients
- `pollResults` - Broadcast updated results
- `pollEnded` - Notify when poll ends
- `studentUpdate` - Update student list
- `sendMessage`/`newMessage` - Chat functionality

## Deployment

### Environment Variables
Create `.env` files for production:

**Backend (.env)**:
```
PORT=5000
NODE_ENV=production
```

**Frontend (.env)**:
```
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

### Hosting Options

#### Option 1: Vercel + Railway
1. **Frontend (Vercel)**:
   - Connect your GitHub repository to Vercel
   - Set build command: `npm run build`
   - Set output directory: `build`
   - Add environment variables

2. **Backend (Railway)**:
   - Connect repository to Railway
   - Add environment variables
   - Railway will auto-deploy

#### Option 2: Netlify + Heroku
1. **Frontend (Netlify)**:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Add environment variables

2. **Backend (Heroku)**:
   - Create `Procfile`: `web: node server.js`
   - Add environment variables
   - Deploy via GitHub integration

#### Option 3: DigitalOcean App Platform
- Deploy both frontend and backend together
- Configure build and run commands
- Set environment variables

### Build Commands

**Frontend**:
```bash
npm run build
```

**Backend**:
```bash
npm start
```

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Mobile Support
- Fully responsive design
- Touch-friendly interface
- Optimized for mobile and tablet

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
MIT License - feel free to use this project for educational or commercial purposes.

---

Built with ❤️ for real-time interactive learning experiences.
