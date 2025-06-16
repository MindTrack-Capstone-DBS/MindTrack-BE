const mysql = require('mysql2');
require('dotenv').config();

let dbConfig = {};
if (process.env.DATABASE_URL) {
  const dbUrl = new URL(process.env.DATABASE_URL);
  dbConfig = {
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    port: dbUrl.port || 3306,
    database: dbUrl.pathname.replace('/', ''),
  };
} else {
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'mindtrack_db',
  };
}

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
          stress_level INT DEFAULT 0,
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

    const createChatSessionsTable = `
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          is_active BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `;

    const createChatMessagesTable = `
        CREATE TABLE IF NOT EXISTS chat_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          session_id INT NOT NULL,
          user_id INT NOT NULL,
          message TEXT NOT NULL,
          is_bot BOOLEAN DEFAULT FALSE,
          stress_prediction FLOAT NULL,
          predicted_class VARCHAR(100) NULL,
          recommendations TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
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

        // Buat tabel chat_sessions
        connection.query(createChatSessionsTable, (err) => {
          if (err) {
            console.error('Error creating chat_sessions table:', err);
            return;
          }
          console.log('Chat sessions table created or already exists');

          // Buat tabel chat_messages
          connection.query(createChatMessagesTable, (err) => {
            if (err) {
              console.error('Error creating chat_messages table:', err);
              return;
            }
            console.log('Chat messages table created or already exists');
            connection.end();
          });
        });
      });
    });
  });
});
