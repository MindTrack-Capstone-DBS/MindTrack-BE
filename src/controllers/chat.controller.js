const { ChatSession, ChatMessage } = require('../models/chat.model');
const mlService = require('../services/ml.service');

exports.createSession = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).send({
        message: 'Judul sesi chat harus diisi!',
      });
    }

    // Set all other sessions to inactive
    await ChatSession.setActive(null, req.userId, false);

    const session = new ChatSession({
      user_id: req.userId,
      title: title,
      is_active: true,
    });

    const savedSession = await ChatSession.create(session);

    res.status(201).send({
      message: 'Sesi chat berhasil dibuat!',
      session: savedSession,
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat membuat sesi chat!',
    });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const sessions = await ChatSession.findByUserIdWithMessageCount(req.userId, limit, offset);

    res.status(200).send({
      message: 'Sesi chat berhasil diambil!',
      sessions: sessions,
      pagination: {
        page: page,
        limit: limit,
        total: sessions.length,
      },
    });
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat mengambil sesi chat!',
    });
  }
};

exports.setActiveSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findById(sessionId, req.userId);
    if (!session) {
      return res.status(404).send({
        message: 'Sesi chat tidak ditemukan!',
      });
    }

    await ChatSession.setActive(sessionId, req.userId, true);

    res.status(200).send({
      message: 'Sesi chat berhasil diaktifkan!',
    });
  } catch (error) {
    console.error('Error setting active session:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat mengaktifkan sesi chat!',
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).send({
        message: 'Pesan tidak boleh kosong!',
      });
    }

    // Verify session exists and belongs to user
    const session = await ChatSession.findById(sessionId, req.userId);
    if (!session) {
      return res.status(404).send({
        message: 'Sesi chat tidak ditemukan!',
      });
    }

    // Save user message
    const userMessage = new ChatMessage({
      session_id: sessionId,
      user_id: req.userId,
      message: message.trim(),
      is_bot: false,
    });

    const savedUserMessage = await ChatMessage.create(userMessage);

    // Get ML prediction
    const mlResult = await mlService.predictStress(message);

    // Generate bot response
    const botResponseText = mlService.generateBotResponse(message, mlResult);

    // Save bot message with ML results
    const botMessage = new ChatMessage({
      session_id: sessionId,
      user_id: req.userId,
      message: botResponseText,
      is_bot: true,
      stress_prediction: mlResult.confidence || null,
      predicted_class: mlResult.prediction || null,
      recommendations: mlResult.recommendations ? JSON.stringify(mlResult.recommendations) : null,
    });

    const savedBotMessage = await ChatMessage.create(botMessage);

    res.status(201).send({
      message: 'Pesan berhasil dikirim!',
      userMessage: savedUserMessage,
      botMessage: {
        ...savedBotMessage,
        recommendations: mlResult.recommendations,
      },
      mlResult: mlResult,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat mengirim pesan!',
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // Verify session exists and belongs to user
    const session = await ChatSession.findById(sessionId, req.userId);
    if (!session) {
      return res.status(404).send({
        message: 'Sesi chat tidak ditemukan!',
      });
    }

    const messages = await ChatMessage.findBySessionId(sessionId, req.userId, limit, offset);

    // Parse recommendations JSON for bot messages
    const parsedMessages = messages.map((msg) => ({
      ...msg,
      recommendations: msg.recommendations ? JSON.parse(msg.recommendations) : null,
    }));

    res.status(200).send({
      message: 'Pesan berhasil diambil!',
      messages: parsedMessages,
      session: session,
      pagination: {
        page: page,
        limit: limit,
        total: messages.length,
      },
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat mengambil pesan!',
    });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const deleted = await ChatSession.delete(sessionId, req.userId);

    if (!deleted) {
      return res.status(404).send({
        message: 'Sesi chat tidak ditemukan!',
      });
    }

    res.status(200).send({
      message: 'Sesi chat berhasil dihapus!',
    });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat menghapus sesi chat!',
    });
  }
};

exports.getLatestMessages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const messages = await ChatMessage.getLatestMessages(req.userId, limit);

    // Parse recommendations JSON for bot messages and ensure all data is included
    const parsedMessages = messages.map((msg) => ({
      ...msg,
      recommendations: msg.recommendations ? JSON.parse(msg.recommendations) : null,
      prediction: msg.predicted_class,
      confidence: msg.stress_prediction,
    }));

    res.status(200).send({
      message: 'Latest messages retrieved successfully!',
      messages: parsedMessages,
    });
  } catch (error) {
    console.error('Error getting latest messages:', error);
    res.status(500).send({
      message: 'Error retrieving latest messages!',
    });
  }
};
