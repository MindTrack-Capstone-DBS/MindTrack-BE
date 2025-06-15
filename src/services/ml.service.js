const axios = require('axios');

class MLService {
  constructor() {
    this.mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';
  }

  async predictStress(text) {
    try {
      const response = await axios.post(
        `${this.mlApiUrl}/predict`,
        {
          text: text,
        },
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        prediction: response.data.prediction,
        recommendations: response.data.recommendations || [],
        confidence: response.data.confidence || null,
      };
    } catch (error) {
      console.error('ML API Error:', error.message);

      // Fallback response if ML API is not available
      return {
        success: false,
        prediction: 'unknown',
        recommendations: ['Cobalah untuk beristirahat sejenak', 'Lakukan aktivitas yang Anda sukai', 'Berbicara dengan orang terdekat jika diperlukan'],
        error: 'ML service temporarily unavailable',
      };
    }
  }

  generateBotResponse(userMessage, mlResult) {
    const responses = {
      stress: [
        'Thank you for sharing your story. Here is an analysis of your current condition and recommendations that might help.',
        'I understand you are experiencing stress. Thank you for sharing your story. Here is an analysis of your current condition and recommendations that might help.',
        'Thank you for trusting me with your feelings. Here is an analysis of your current condition and recommendations that might help.',
      ],
      anxiety: [
        'Thank you for sharing your story. Here is an analysis of your current condition and recommendations that might help.',
        'I understand the anxious feelings you are experiencing. Thank you for sharing your story. Here is an analysis of your current condition and recommendations that might help.',
        'Thank you for trusting me. Here is an analysis of your current condition and recommendations that might help.',
      ],
      depression: [
        'Thank you for sharing your story. Here is an analysis of your current condition and recommendations that might help.',
        'I understand how heavy the feelings you are experiencing are. Thank you for sharing your story. Here is an analysis of your current condition and recommendations that might help.',
        'Thank you for trusting me. Here is an analysis of your current condition and recommendations that might help.',
      ],
      normal: [
        'Thank you for sharing your story. Here is an analysis of your current condition and recommendations that might help.',
        'Thank you for sharing. Here is an analysis of your current condition and recommendations that might help.',
        'Thank you for sharing your story. Here is an analysis of your current condition and recommendations that might help.',
      ],
      unknown: [
        'Thank you for sharing your story. Here is an analysis of your current condition and recommendations that might help.',
        'Thank you for sharing. Here is an analysis of your current condition and recommendations that might help.',
        'Thank you for sharing your story. Here is an analysis of your current condition and recommendations that might help.',
      ],
    };

    const category = mlResult.prediction || 'unknown';
    const categoryResponses = responses[category] || responses['unknown'];
    const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

    return randomResponse;
  }
}

module.exports = new MLService();
