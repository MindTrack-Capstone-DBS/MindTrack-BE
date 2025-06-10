const mysql = require('mysql2');
require('dotenv').config();

// Konfigurasi koneksi
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

// Buat koneksi
const connection = mysql.createConnection(dbConfig);

// Buat database jika belum ada
connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'mindtrack_db'}`, (err) => {
  if (err) {
    console.error('Error creating database:', err);
    return;
  }
  console.log('Database created or already exists');

  // Gunakan database
  connection.query(`USE ${process.env.DB_NAME || 'mindtrack_db'}`, (err) => {
    if (err) {
      console.error('Error using database:', err);
      return;
    }

    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          phone VARCHAR(20),
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;

    const createJournalsTable = `
        CREATE TABLE IF NOT EXISTS journals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255),
          content TEXT NOT NULL,
          mood_emoji VARCHAR(10) NOT NULL,
          mood_value INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `;

    // Buat tabel users
    connection.query(createUsersTable, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
        return;
      }
      console.log('Users table created or already exists');
      
      // Buat tabel journals
      connection.query(createJournalsTable, (err) => {
        if (err) {
          console.error('Error creating journals table:', err);
          return;
        }
        console.log('Journals table created or already exists');
        connection.end();
      });
    });
  });
});
