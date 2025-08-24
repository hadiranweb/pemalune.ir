const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class GoogleSheetsService {
  constructor() {
    this.doc = null;
    this.isInitialized = false;
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  async initialize() {
    try {
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
        console.warn('Google Sheets credentials not configured. Using fallback data.');
        this.isInitialized = false;
        return;
      }

      const serviceAccountAuth = new JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
        ],
      });

      this.doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
      await this.doc.loadInfo();
      
      console.log(`Connected to Google Sheet: ${this.doc.title}`);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error.message);
      this.isInitialized = false;
    }
  }

  // Cache helper methods
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Read operations with caching
  async getQuestions(questionId, language = 'en') {
    const cacheKey = `questions_${questionId}_${language}`;
    const cached = this.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.isInitialized) {
      return this.getFallbackQuestions(questionId, language);
    }

    try {
      const sheet = this.doc.sheetsByTitle['Questions'];
      if (!sheet) {
        console.warn('Questions sheet not found. Using fallback data.');
        return this.getFallbackQuestions(questionId, language);
      }

      const rows = await sheet.getRows();
      const question = rows.find(row => 
        row.get('id') === questionId && row.get('language') === language
      );

      if (!question) {
        return this.getFallbackQuestions(questionId, language);
      }

      const result = {
        id: question.get('id'),
        language: question.get('language'),
        title: question.get('title'),
        question: question.get('question'),
        options: JSON.parse(question.get('options') || '[]'),
        hasLetter: question.get('hasLetter') === 'TRUE',
        letterContent: question.get('letterContent') || '',
        content: question.get('content') || ''
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching questions from Google Sheets:', error);
      return this.getFallbackQuestions(questionId, language);
    }
  }

  async getLetterContent(questionId, language = 'en') {
    const cacheKey = `letter_${questionId}_${language}`;
    const cached = this.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.isInitialized) {
      return this.getFallbackLetterContent(questionId, language);
    }

    try {
      const sheet = this.doc.sheetsByTitle['Letter_Content'];
      if (!sheet) {
        console.warn('Letter_Content sheet not found. Using fallback data.');
        return this.getFallbackLetterContent(questionId, language);
      }

      const rows = await sheet.getRows();
      const content = rows.find(row => 
        row.get('questionId') === questionId && row.get('language') === language
      );

      const result = content ? content.get('content') : this.getFallbackLetterContent(questionId, language);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching letter content from Google Sheets:', error);
      return this.getFallbackLetterContent(questionId, language);
    }
  }

  // Write operations
  async saveSubmission(data) {
    if (!this.isInitialized) {
      console.warn('Google Sheets not initialized. Submission not saved:', data);
      return { success: false, message: 'Google Sheets not configured' };
    }

    try {
      let sheet = this.doc.sheetsByTitle['Submissions'];
      
      // Create Submissions sheet if it doesn't exist
      if (!sheet) {
        sheet = await this.doc.addSheet({
          title: 'Submissions',
          headerValues: ['timestamp', 'phoneNumber', 'language', 'questionPath', 'additionalData']
        });
      }

      await sheet.addRow({
        timestamp: new Date().toISOString(),
        phoneNumber: data.phoneNumber || '',
        language: data.language || 'en',
        questionPath: data.questionPath || '',
        additionalData: JSON.stringify(data.additionalData || {})
      });

      // Clear submissions cache
      this.clearCache('submissions');

      return { success: true, message: 'Submission saved successfully' };
    } catch (error) {
      console.error('Error saving submission to Google Sheets:', error);
      return { success: false, message: 'Failed to save submission' };
    }
  }

  async getSubmissions() {
    const cacheKey = 'submissions_all';
    const cached = this.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.isInitialized) {
      return [];
    }

    try {
      const sheet = this.doc.sheetsByTitle['Submissions'];
      if (!sheet) {
        return [];
      }

      const rows = await sheet.getRows();
      const submissions = rows.map(row => ({
        timestamp: row.get('timestamp'),
        phoneNumber: row.get('phoneNumber'),
        language: row.get('language'),
        questionPath: row.get('questionPath'),
        additionalData: JSON.parse(row.get('additionalData') || '{}')
      }));

      this.setCache(cacheKey, submissions);
      return submissions;
    } catch (error) {
      console.error('Error fetching submissions from Google Sheets:', error);
      return [];
    }
  }

  // Fallback data methods
  getFallbackQuestions(questionId, language) {
    const fallbackData = {
      'home': {
        'en': {
          id: 'home',
          language: 'en',
          title: 'Welcome',
          question: 'What would you like to explore today?',
          options: [
            { id: 'services', text: 'Learn About Our Services', nextQuestion: 'services' },
            { id: 'contact', text: 'Contact Information', nextQuestion: 'contact' },
            { id: 'about', text: 'About Us', nextQuestion: 'about' }
          ],
          hasLetter: false,
          letterContent: '',
          content: 'Welcome to our interactive experience!'
        },
        'ar': {
          id: 'home',
          language: 'ar',
          title: 'مرحباً',
          question: 'ماذا تود أن تستكشف اليوم؟',
          options: [
            { id: 'services', text: 'تعرف على خدماتنا', nextQuestion: 'services' },
            { id: 'contact', text: 'معلومات الاتصال', nextQuestion: 'contact' },
            { id: 'about', text: 'من نحن', nextQuestion: 'about' }
          ],
          hasLetter: false,
          letterContent: '',
          content: 'مرحباً بك في تجربتنا التفاعلية!'
        },
        'fa': {
          id: 'home',
          language: 'fa',
          title: 'خوش آمدید',
          question: 'امروز چه چیزی را می‌خواهید کاوش کنید؟',
          options: [
            { id: 'services', text: 'درباره خدمات ما بیاموزید', nextQuestion: 'services' },
            { id: 'contact', text: 'اطلاعات تماس', nextQuestion: 'contact' },
            { id: 'about', text: 'درباره ما', nextQuestion: 'about' }
          ],
          hasLetter: false,
          letterContent: '',
          content: 'به تجربه تعاملی ما خوش آمدید!'
        }
      },
      'services': {
        'en': {
          id: 'services',
          language: 'en',
          title: 'Our Services',
          question: 'Which service interests you most?',
          options: [
            { id: 'web-dev', text: 'Web Development', nextQuestion: 'web-details' },
            { id: 'consulting', text: 'Consulting', nextQuestion: 'consulting-details' }
          ],
          hasLetter: true,
          letterContent: 'Thank you for your interest in our services. We would love to discuss how we can help your business grow.',
          content: 'We provide comprehensive digital solutions for businesses of all sizes.'
        }
      }
    };

    return fallbackData[questionId]?.[language] || {
      id: questionId,
      language,
      title: 'Question Not Found',
      question: 'This question is not available.',
      options: [],
      hasLetter: false,
      letterContent: '',
      content: 'Content not available.'
    };
  }

  getFallbackLetterContent(questionId, language) {
    const fallbackContent = {
      'services': {
        'en': 'Thank you for your interest in our services. We would love to discuss how we can help your business grow.',
        'ar': 'شكراً لاهتمامك بخدماتنا. نود أن نناقش كيف يمكننا مساعدة عملك على النمو.',
        'fa': 'از علاقه شما به خدمات ما متشکریم. دوست داریم در مورد اینکه چگونه می‌توانیم به رشد کسب و کار شما کمک کنیم، صحبت کنیم.'
      }
    };

    return fallbackContent[questionId]?.[language] || 'Letter content not available.';
  }
}

// Global instance
let googleSheetsService = null;

const initializeGoogleSheets = async () => {
  googleSheetsService = new GoogleSheetsService();
  await googleSheetsService.initialize();
  return googleSheetsService;
};

const getGoogleSheetsService = () => {
  if (!googleSheetsService) {
    throw new Error('Google Sheets service not initialized');
  }
  return googleSheetsService;
};

module.exports = {
  GoogleSheetsService,
  initializeGoogleSheets,
  getGoogleSheetsService
};

