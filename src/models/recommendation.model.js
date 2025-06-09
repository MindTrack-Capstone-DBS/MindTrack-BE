const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

class Recommendation {
  static async getConnection() {
    return await mysql.createConnection({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB,
    });
  }

  static async findByStressLevel(stressLevel) {
    const connection = await this.getConnection();
    try {
      // Jika tabel recommendations belum ada, kita buat dummy data untuk sementara
      // Dalam implementasi sebenarnya, ini akan mengambil data dari database
      const dummyRecommendations = [
        { title: 'Morning Run', duration: '45min' },
        { title: '1.5 of water daily', duration: 'All day' },
        { title: 'Cooking mealpreps for 3 days', duration: '2h' },
      ];
      
      await connection.end();
      return dummyRecommendations;
      
      // Uncomment kode di bawah ini jika tabel recommendations sudah dibuat
      /*
      const [rows] = await connection.execute(
        'SELECT * FROM recommendations WHERE min_stress_level <= ? AND max_stress_level >= ? ORDER BY priority DESC LIMIT 3',
        [stressLevel, stressLevel]
      );
      await connection.end();
      return rows;
      */
    } catch (error) {
      await connection.end();
      console.error('Error finding recommendations:', error);
      return [];
    }
  }
}

module.exports = Recommendation;