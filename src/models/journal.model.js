const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

class Journal {
  constructor(journal) {
    this.user_id = journal.user_id;
    this.title = journal.title;
    this.content = journal.content;
    this.mood_emoji = journal.mood_emoji;
    this.mood_value = journal.mood_value;
  }

  static async getConnection() {
    return await mysql.createConnection({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB,
    });
  }

  static async create(newJournal) {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute('INSERT INTO journals (user_id, title, content, mood_emoji, mood_value) VALUES (?, ?, ?, ?, ?)', [
        newJournal.user_id,
        newJournal.title,
        newJournal.content,
        newJournal.mood_emoji,
        newJournal.mood_value,
      ]);
      await connection.end();
      return { id: result.insertId, ...newJournal };
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async findByUserId(userId, limit = 10, offset = 0) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM journals WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [userId, limit, offset]);
      await connection.end();
      return rows;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async findById(id, userId) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM journals WHERE id = ? AND user_id = ?', [id, userId]);
      await connection.end();
      return rows.length ? rows[0] : null;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async update(id, userId, journalData) {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute('UPDATE journals SET title = ?, content = ?, mood_emoji = ?, mood_value = ? WHERE id = ? AND user_id = ?', [
        journalData.title,
        journalData.content,
        journalData.mood_emoji,
        journalData.mood_value,
        id,
        userId,
      ]);
      await connection.end();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async delete(id, userId) {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute('DELETE FROM journals WHERE id = ? AND user_id = ?', [id, userId]);
      await connection.end();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async getMoodStats(userId, period = 'month') {
    const connection = await this.getConnection();
    try {
      let query;
      if (period === 'week') {
        query = `
          SELECT 
            DATE_FORMAT(created_at, '%a') as day, 
            AVG(mood_value) as average_mood 
          FROM journals 
          WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
          GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') 
          ORDER BY created_at
        `;
      } else {
        // month
        query = `
          SELECT 
            DATE_FORMAT(created_at, '%d') as day, 
            AVG(mood_value) as average_mood 
          FROM journals 
          WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
          GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') 
          ORDER BY created_at
        `;
      }

      const [rows] = await connection.execute(query, [userId]);
      await connection.end();
      return rows;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }
}

module.exports = Journal;
