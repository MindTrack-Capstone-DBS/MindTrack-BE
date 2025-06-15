const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

class ChatSession {
  constructor(session) {
    this.user_id = session.user_id;
    this.title = session.title;
    this.is_active = session.is_active || false;
  }

  static async getConnection() {
    return await mysql.createConnection({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB,
    });
  }

  static async create(newSession) {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute('INSERT INTO chat_sessions (user_id, title, is_active) VALUES (?, ?, ?)', [newSession.user_id, newSession.title, newSession.is_active]);
      await connection.end();
      return { id: result.insertId, ...newSession };
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async findByUserId(userId, limit = 10, offset = 0) {
    const connection = await this.getConnection();
    try {
      // Ensure limit and offset are integers and safe for string interpolation
      const limitInt = parseInt(limit) || 10;
      const offsetInt = parseInt(offset) || 0;

      // Use string interpolation for LIMIT and OFFSET, but keep userId as parameter for security
      const [rows] = await connection.execute(`SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`, [userId]);
      await connection.end();
      return rows;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  // New method to get sessions with message count
  static async findByUserIdWithMessageCount(userId, limit = 10, offset = 0) {
    const connection = await this.getConnection();
    try {
      const limitInt = parseInt(limit) || 10;
      const offsetInt = parseInt(offset) || 0;

      // Only get sessions that have at least one message (indicating interaction)
      const [rows] = await connection.execute(
        `SELECT cs.*, COUNT(cm.id) as message_count 
         FROM chat_sessions cs 
         LEFT JOIN chat_messages cm ON cs.id = cm.session_id 
         WHERE cs.user_id = ? 
         GROUP BY cs.id 
         HAVING message_count > 0 
         ORDER BY cs.updated_at DESC 
         LIMIT ${limitInt} OFFSET ${offsetInt}`,
        [userId]
      );
      await connection.end();
      return rows;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async findById(sessionId, userId) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
      await connection.end();
      return rows.length ? rows[0] : null;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async setActive(sessionId, userId, isActive = true) {
    const connection = await this.getConnection();
    try {
      // First, set all sessions to inactive
      await connection.execute('UPDATE chat_sessions SET is_active = FALSE WHERE user_id = ?', [userId]);

      // Then set the specified session to active
      if (isActive) {
        const [result] = await connection.execute('UPDATE chat_sessions SET is_active = TRUE WHERE id = ? AND user_id = ?', [sessionId, userId]);
        await connection.end();
        return result.affectedRows > 0;
      }

      await connection.end();
      return true;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async delete(sessionId, userId) {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute('DELETE FROM chat_sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
      await connection.end();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }
}

class ChatMessage {
  constructor(message) {
    this.session_id = message.session_id;
    this.user_id = message.user_id;
    this.message = message.message;
    this.is_bot = message.is_bot || false;
    this.stress_prediction = message.stress_prediction || null;
    this.predicted_class = message.predicted_class || null;
    this.recommendations = message.recommendations || null;
  }

  static async getConnection() {
    return await mysql.createConnection({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB,
    });
  }

  static async create(newMessage) {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute('INSERT INTO chat_messages (session_id, user_id, message, is_bot, stress_prediction, predicted_class, recommendations) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        newMessage.session_id,
        newMessage.user_id,
        newMessage.message,
        newMessage.is_bot,
        newMessage.stress_prediction,
        newMessage.predicted_class,
        newMessage.recommendations,
      ]);

      // Update session's updated_at timestamp when a message is added
      await connection.execute('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newMessage.session_id]);

      await connection.end();
      return { id: result.insertId, ...newMessage };
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async findBySessionId(sessionId, userId, limit = 50, offset = 0) {
    const connection = await this.getConnection();
    try {
      // Pastikan limit dan offset adalah integer
      const limitInt = parseInt(limit) || 50;
      const offsetInt = parseInt(offset) || 0;

      // Gunakan string interpolation untuk LIMIT dan OFFSET, tapi tetap gunakan parameter untuk sessionId dan userId
      const [rows] = await connection.execute(
        `SELECT cm.* FROM chat_messages cm 
         JOIN chat_sessions cs ON cm.session_id = cs.id 
         WHERE cm.session_id = ? AND cs.user_id = ? 
         ORDER BY cm.created_at ASC LIMIT ${limitInt} OFFSET ${offsetInt}`,
        [sessionId, userId]
      );
      await connection.end();
      return rows;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async getLatestMessages(userId, limit = 10) {
    const connection = await this.getConnection();
    try {
      const limitInt = parseInt(limit) || 10;
      
      const [rows] = await connection.execute(
        `SELECT cm.*, cs.title as session_title FROM chat_messages cm 
         JOIN chat_sessions cs ON cm.session_id = cs.id 
         WHERE cs.user_id = ? 
         ORDER BY cm.created_at DESC LIMIT ${limitInt}`,
        [userId]
      );
      await connection.end();
      return rows;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }
}

module.exports = { ChatSession, ChatMessage };
