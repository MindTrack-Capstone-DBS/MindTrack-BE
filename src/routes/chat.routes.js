const express = require('express');
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Semua routes memerlukan autentikasi
router.use(authMiddleware);

// Chat session endpoints
router.post('/sessions', chatController.createSession);
router.get('/sessions', chatController.getSessions);
router.put('/sessions/:sessionId/activate', chatController.setActiveSession);
router.delete('/sessions/:sessionId', chatController.deleteSession);

// Chat message endpoints
router.post('/sessions/:sessionId/messages', chatController.sendMessage);
router.get('/sessions/:sessionId/messages', chatController.getMessages);
router.get('/messages/latest', chatController.getLatestMessages);

// Recommendations endpoint
router.get('/latest-recommendations', chatController.getLatestRecommendations);

module.exports = router;
