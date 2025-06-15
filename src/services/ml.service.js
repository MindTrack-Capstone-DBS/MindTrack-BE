const axios = require('axios');

class MLService {
  constructor() {
    this.mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';
  }

  async predictStress(text) {
    try {
      const response = await axios.post(`${this.mlApiUrl}/predict`, {
        text: text
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        prediction: response.data.prediction,
        recommendations: response.data.recommendations || [],
        confidence: response.data.confidence || null
      };
    } catch (error) {
      console.error('ML API Error:', error.message);
      
      // Fallback response if ML API is not available
      return {
        success: false,
        prediction: 'unknown',
        recommendations: [
          'Cobalah untuk beristirahat sejenak',
          'Lakukan aktivitas yang Anda sukai',
          'Berbicara dengan orang terdekat jika diperlukan'
        ],
        error: 'ML service temporarily unavailable'
      };
    }
  }

  generateBotResponse(userMessage, mlResult) {
    const responses = {
      'stress': [
        'Saya memahami Anda sedang mengalami stres. Mari kita bicarakan lebih lanjut tentang apa yang Anda rasakan.',
        'Terima kasih telah berbagi. Stres memang bisa sangat mengganggu. Apa yang paling membebani pikiran Anda saat ini?',
        'Saya di sini untuk mendengarkan. Ceritakan lebih detail tentang situasi yang membuat Anda stres.'
      ],
      'anxiety': [
        'Saya mengerti perasaan cemas yang Anda alami. Anda tidak sendirian dalam menghadapi ini.',
        'Kecemasan memang bisa sangat mengganggu. Apakah ada pemicu khusus yang membuat Anda merasa cemas?',
        'Terima kasih sudah mempercayai saya. Mari kita cari cara untuk mengelola perasaan cemas ini bersama-sama.'
      ],
      'depression': [
        'Saya memahami betapa beratnya perasaan yang Anda alami. Anda sudah sangat berani untuk berbagi.',
        'Perasaan seperti ini memang sangat berat. Saya di sini untuk mendampingi Anda.',
        'Terima kasih telah mempercayai saya. Anda tidak sendirian dalam menghadapi perasaan ini.'
      ],
      'normal': [
        'Senang mendengar Anda dalam kondisi yang baik. Bagaimana hari Anda berjalan?',
        'Terima kasih telah berbagi. Apakah ada hal lain yang ingin Anda ceritakan?',
        'Saya di sini untuk mendengarkan. Ceritakan lebih banyak tentang perasaan Anda hari ini.'
      ],
      'unknown': [
        'Terima kasih telah berbagi. Bagaimana perasaan Anda saat ini?',
        'Saya di sini untuk mendengarkan. Ceritakan lebih lanjut tentang apa yang Anda rasakan.',
        'Apa yang paling mengganggu pikiran Anda hari ini?'
      ]
    };

    const category = mlResult.prediction || 'unknown';
    const categoryResponses = responses[category] || responses['unknown'];
    const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

    return randomResponse;
  }
}

module.exports = new MLService();