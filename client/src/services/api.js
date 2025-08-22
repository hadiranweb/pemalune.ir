const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    return this.request('/health');
  }

  // Questions API
  async getHomeQuestion(language = 'en') {
    return this.request(`/questions/home/${language}`);
  }

  async getQuestion(questionId, language = 'en') {
    return this.request(`/questions/${questionId}/${language}`);
  }

  async getAllQuestions(language = 'en') {
    return this.request(`/questions/all/${language}`);
  }

  async navigateToNextQuestion(fromQuestion, selectedOption, language = 'en') {
    return this.request('/questions/navigate', {
      method: 'POST',
      body: JSON.stringify({
        fromQuestion,
        selectedOption,
        language,
      }),
    });
  }

  // Content API
  async getAvailableLanguages() {
    return this.request('/content/languages');
  }

  async getLetterContent(questionId, language = 'en') {
    return this.request(`/content/letter/${questionId}/${language}`);
  }

  async storePhoneNumber(phoneNumber) {
    return this.request('/content/phone', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  async getStats() {
    return this.request('/content/stats');
  }
}

export default new ApiService();

