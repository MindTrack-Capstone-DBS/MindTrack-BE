const express = require('express');
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Semua routes memerlukan autentikasi
router.use(authMiddleware);

// Chat routes
router.get('/sessions', chatController.getSessions);
router.post('/sessions', chatController.createSession);
router.get('/sessions/:sessionId/messages', chatController.getSessionMessages);
router.post('/message', chatController.sendMessage);

module.exports = router;
