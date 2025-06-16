require('dotenv').config();

let config = {};

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL
  const dbUrl = new URL(process.env.DATABASE_URL);
  config = {
    HOST: dbUrl.hostname,
    USER: dbUrl.username,
    PASSWORD: dbUrl.password,
    DB: dbUrl.pathname.replace('/', ''),
    PORT: dbUrl.port || 3306,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
} else {
  config = {
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASSWORD || "",
    DB: process.env.DB_NAME || "mindtrack_db",
    PORT: process.env.DB_PORT || 3306,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
}

module.exports = config;