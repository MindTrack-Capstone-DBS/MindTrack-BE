const Chat = require('../models/chat.model');
const Recommendation = require('../models/recommendation.model');

// Get user's chat sessions
exports.getSessions = async (req, res) => {
  try {
    const userId = req.userId;
    const sessions = await Chat.getUserSessions(userId);
    
    res.status(200).send({
      message: 'Sessions retrieved successfully',
      sessions: sessions
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat mengambil sessions!'
    });
  }
};

// Get messages for a session
exports.getSessionMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const sessionId = req.params.sessionId;
    
    const messages = await Chat.getSessionMessages(sessionId, userId);
    
    res.status(200).send({
      message: 'Messages retrieved successfully',
      messages: messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat mengambil messages!'
    });
  }
};

// Send message and get AI response
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { message, session_id, stress_prediction, recommendations } = req.body;
    
    if (!message) {
      return res.status(400).send({
        message: 'Message is required!'
      });
    }

    // Get or create active session
    let sessionId = session_id;
    if (!sessionId) {
      const session = await Chat.getOrCreateActiveSession(userId);
      sessionId = session.id;
    }

    // Save user message
    await Chat.addMessage(sessionId, userId, message, false, stress_prediction, recommendations);

    // Generate AI response based on stress level
    let botResponse = "Terima kasih telah berbagi. Saya di sini untuk membantu Anda.";
    let botRecommendations = [];

    if (stress_prediction !== null && stress_prediction !== undefined) {
      const stressLevel = Math.round(stress_prediction);
      
      // Get recommendations based on stress level
      if (recommendations && recommendations.length > 0) {
        botRecommendations = recommendations;
      } else {
        // Fallback recommendations
        const defaultRecommendations = await Recommendation.findByStressLevel(stressLevel);
        botRecommendations = defaultRecommendations.map(rec => rec.title || rec);
      }

      if (stressLevel >= 5) {
        botResponse = "Saya melihat Anda sedang mengalami tingkat stress yang tinggi. Berikut beberapa saran yang mungkin membantu:";
      } else if (stressLevel >= 3) {
        botResponse = "Sepertinya Anda sedang mengalami stress sedang. Mari kita coba beberapa teknik untuk membantu Anda merasa lebih baik:";
      } else {
        botResponse = "Senang mendengar Anda dalam kondisi yang relatif baik. Berikut beberapa tips untuk menjaga kesehatan mental Anda:";
      }
    }

    // Save bot response
    await Chat.addMessage(sessionId, userId, botResponse, true, null, botRecommendations);

    res.status(200).send({
      message: 'Message sent successfully',
      session_id: sessionId,
      bot_response: {
        message: botResponse,
        recommendations: botRecommendations
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat mengirim message!'
    });
  }
};

// Create new chat session
exports.createSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;
    
    const session = await Chat.createSession(userId, title || `Chat ${new Date().toLocaleDateString()}`);
    
    res.status(201).send({
      message: 'Session created successfully',
      session: session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat membuat session!'
    });
  }
};
