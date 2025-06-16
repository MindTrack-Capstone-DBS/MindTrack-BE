const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

class User {
  constructor(user) {
    this.name = user.name;
    this.email = user.email;
    this.phone = user.phone;
    this.password = user.password;
  }

  static async getConnection() {
    return await mysql.createConnection({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB,
      port: dbConfig.PORT || 3306,
    });
  }

  static async create(newUser) {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute('INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)', [newUser.name, newUser.email, newUser.phone, newUser.password]);
      await connection.end();
      return { id: result.insertId, ...newUser };
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async findByEmail(email) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
      await connection.end();
      return rows.length ? rows[0] : null;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async findById(id) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute('SELECT id, name, email, phone, created_at, updated_at FROM users WHERE id = ?', [id]);
      await connection.end();
      return rows.length ? rows[0] : null;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  static async update(id, userData) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(userData)
        .map((key) => `${key} = ?`)
        .join(', ');
      const values = Object.values(userData);
      values.push(id);

      const query = `UPDATE users SET ${fields} WHERE id = ?`;

      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}

module.exports = User;
