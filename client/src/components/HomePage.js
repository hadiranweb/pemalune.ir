import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import './HomePage.css';

const HomePage = ({ language, onAnswerSelect }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHomeQuestion = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await ApiService.getHomeQuestion(language);
        
        setTimeout(() => {
          setCurrentQuestion(response.data);
          setIsLoaded(true);
          setLoading(false);
        }, 300);
      } catch (err) {
        console.error('Failed to load home question:', err);
        setError(err.message);
        setLoading(false);
        
        // Fallback to static data
        const fallbackQuestions = {
          en: {
            id: 'home',
            title: 'Welcome to Our Interactive Experience',
            question: 'What would you like to explore today?',
            options: [
              { id: 'option1', text: 'Learn About Our Services', nextQuestion: 'services' },
              { id: 'option2', text: 'Discover Our Products', nextQuestion: 'products' },
              { id: 'option3', text: 'Contact Information', nextQuestion: 'contact' }
            ]
          },
          ar: {
            id: 'home',
            title: 'مرحباً بك في تجربتنا التفاعلية',
            question: 'ماذا تود أن تستكشف اليوم؟',
            options: [
              { id: 'option1', text: 'تعرف على خدماتنا', nextQuestion: 'services' },
              { id: 'option2', text: 'اكتشف منتجاتنا', nextQuestion: 'products' },
              { id: 'option3', text: 'معلومات الاتصال', nextQuestion: 'contact' }
            ]
          },
          fa: {
            id: 'home',
            title: 'به تجربه تعاملی ما خوش آمدید',
            question: 'امروز چه چیزی را می‌خواهید کشف کنید؟',
            options: [
              { id: 'option1', text: 'درباره خدمات ما بیاموزید', nextQuestion: 'services' },
              { id: 'option2', text: 'محصولات ما را کشف کنید', nextQuestion: 'products' },
              { id: 'option3', text: 'اطلاعات تماس', nextQuestion: 'contact' }
            ]
          }
        };
        
        setTimeout(() => {
          setCurrentQuestion(fallbackQuestions[language] || fallbackQuestions.en);
          setIsLoaded(true);
          setLoading(false);
        }, 300);
      }
    };

    loadHomeQuestion();
  }, [language]);

  const handleOptionClick = async (option) => {
    try {
      // Try to navigate using API first
      const response = await ApiService.navigateToNextQuestion('home', option.id, language);
      if (response.success && response.data.nextQuestion) {
        onAnswerSelect(option.id, response.data.nextQuestion);
      } else {
        // Fallback to direct navigation
        onAnswerSelect(option.id, option.nextQuestion);
      }
    } catch (err) {
      console.error('Navigation failed, using fallback:', err);
      // Fallback to direct navigation
      onAnswerSelect(option.id, option.nextQuestion);
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !currentQuestion) {
    return (
      <div className="home-container">
        <div className="error-message">
          <h2>Unable to load content</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className={`home-content ${isLoaded ? 'loaded' : ''}`}>
        <div className="question-header">
          <h1 className="question-title">{currentQuestion.title}</h1>
          <p className="question-text">{currentQuestion.question}</p>
        </div>
        
        <div className="options-container">
          {currentQuestion.options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className="option-button"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="option-number">{index + 1}</span>
              <span className="option-text">{option.text}</span>
              <span className="option-arrow">→</span>
            </button>
          ))}
        </div>
        
        <div className="decorative-elements">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

