const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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
