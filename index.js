const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Start ML API server
const startMLAPI = () => {
  console.log('Starting ML API server...');

  const mlApiPath = path.join(__dirname, 'src', 'ml-api');
  const pythonProcess = spawn('uvicorn', ['main:app', '--reload', '--port', '8000'], {
    cwd: mlApiPath,
    shell: true,
    stdio: 'inherit',
  });

  pythonProcess.on('error', (err) => {
    console.error('Failed to start ML API server:', err);
  });

  process.on('exit', () => {
    pythonProcess.kill();
  });
};

// Only start ML API in development mode
if (process.env.NODE_ENV !== 'production') {
  startMLAPI();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/journals', require('./src/routes/journal.routes'));
app.use('/api/chats', require('./src/routes/chat.routes'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Selamat datang di API MindTrack' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
