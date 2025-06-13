const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

class Chat {
  static async getConnection() {
    return await mysql.createConnection({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB,
    });
  }

  // Create new chat session
  static async createSession(userId, title) {
    const connection = await this.getConnection();
    try {
      // Set all other sessions to inactive
      await connection.execute('UPDATE chat_sessions SET is_active = FALSE WHERE user_id = ?', [userId]);

      // Create new session
      const [result] = await connection.execute('INSERT INTO chat_sessions (user_id, title, is_active) VALUES (?, ?, TRUE)', [userId, title]);
      await connection.end();
      return { id: result.insertId, user_id: userId, title, is_active: true };
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  // Get user's chat sessions
  static async getUserSessions(userId) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
      await connection.end();
      return rows;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  // Add message to session
  static async addMessage(sessionId, userId, message, isBot = false, stressPrediction = null, recommendations = null) {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute('INSERT INTO chat_messages (session_id, user_id, message, is_bot, stress_prediction, recommendations) VALUES (?, ?, ?, ?, ?, ?)', [
        sessionId,
        userId,
        message,
        isBot,
        stressPrediction,
        recommendations ? JSON.stringify(recommendations) : null,
      ]);

      // Update session timestamp
      await connection.execute('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [sessionId]);

      await connection.end();
      return { id: result.insertId, session_id: sessionId, user_id: userId, message, is_bot: isBot, stress_prediction: stressPrediction, recommendations };
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  // Get messages for a session
  static async getSessionMessages(sessionId, userId) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM chat_messages WHERE session_id = ? AND user_id = ? ORDER BY created_at ASC', [sessionId, userId]);
      await connection.end();
      return rows.map((row) => ({
        ...row,
        recommendations: row.recommendations ? JSON.parse(row.recommendations) : null,
      }));
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  // Get or create active session
  static async getOrCreateActiveSession(userId) {
    const connection = await this.getConnection();
    try {
      // Check for active session
      const [rows] = await connection.execute('SELECT * FROM chat_sessions WHERE user_id = ? AND is_active = TRUE', [userId]);

      if (rows.length > 0) {
        await connection.end();
        return rows[0];
      }

      // Create new session if none exists
      await connection.end();
      return await this.createSession(userId, `Chat ${new Date().toLocaleDateString()}`);
    } catch (error) {
      await connection.end();
      throw error;
    }
  }
}

module.exports = Chat;
