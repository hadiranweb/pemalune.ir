import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import './SubPage.css';

const SubPage = ({ question, language, onAnswerSelect, onGoBack }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [showLetter, setShowLetter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSubPageContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await ApiService.getQuestion(question, language);
        
        setTimeout(() => {
          setCurrentContent(response.data);
          setIsLoaded(true);
          setLoading(false);
          
          if (response.data?.hasLetter) {
            setTimeout(() => setShowLetter(true), 500);
          }
        }, 300);
      } catch (err) {
        console.error('Failed to load sub-page content:', err);
        setError(err.message);
        setLoading(false);
        
        // Fallback to static data
        const fallbackContent = {
          services: {
            en: {
              title: 'Our Services',
              content: 'We provide comprehensive digital solutions including web development, mobile applications, and cloud services.',
              hasLetter: true,
              letterContent: 'Thank you for your interest in our services. We would love to discuss how we can help your business grow.',
              subQuestion: {
                question: 'Which service interests you most?',
                options: [
                  { id: 'web', text: 'Web Development', nextQuestion: 'web-details' },
                  { id: 'mobile', text: 'Mobile Apps', nextQuestion: 'mobile-details' },
                  { id: 'cloud', text: 'Cloud Services', nextQuestion: 'cloud-details' }
                ]
              }
            },
            ar: {
              title: 'خدماتنا',
              content: 'نحن نقدم حلول رقمية شاملة تشمل تطوير المواقع والتطبيقات المحمولة وخدمات السحابة.',
              hasLetter: true,
              letterContent: 'شكراً لاهتمامك بخدماتنا. نود مناقشة كيف يمكننا مساعدة عملك على النمو.',
              subQuestion: {
                question: 'أي خدمة تهمك أكثر؟',
                options: [
                  { id: 'web', text: 'تطوير المواقع', nextQuestion: 'web-details' },
                  { id: 'mobile', text: 'تطبيقات الجوال', nextQuestion: 'mobile-details' },
                  { id: 'cloud', text: 'خدمات السحابة', nextQuestion: 'cloud-details' }
                ]
              }
            },
            fa: {
              title: 'خدمات ما',
              content: 'ما راه‌حل‌های دیجیتال جامعی ارائه می‌دهیم شامل توسعه وب، اپلیکیشن‌های موبایل و خدمات ابری.',
              hasLetter: true,
              letterContent: 'از علاقه شما به خدمات ما متشکریم. دوست داریم در مورد چگونگی کمک به رشد کسب‌وکار شما صحبت کنیم.',
              subQuestion: {
                question: 'کدام خدمت بیشتر مورد علاقه شماست؟',
                options: [
                  { id: 'web', text: 'توسعه وب', nextQuestion: 'web-details' },
                  { id: 'mobile', text: 'اپلیکیشن موبایل', nextQuestion: 'mobile-details' },
                  { id: 'cloud', text: 'خدمات ابری', nextQuestion: 'cloud-details' }
                ]
              }
            }
          },
          products: {
            en: {
              title: 'Our Products',
              content: 'Discover our innovative product line designed to streamline your workflow and boost productivity.',
              hasLetter: false,
              subQuestion: {
                question: 'What type of product are you looking for?',
                options: [
                  { id: 'software', text: 'Software Solutions', nextQuestion: 'software-details' },
                  { id: 'hardware', text: 'Hardware Products', nextQuestion: 'hardware-details' }
                ]
              }
            },
            ar: {
              title: 'منتجاتنا',
              content: 'اكتشف خط منتجاتنا المبتكر المصمم لتبسيط سير عملك وزيادة الإنتاجية.',
              hasLetter: false,
              subQuestion: {
                question: 'ما نوع المنتج الذي تبحث عنه؟',
                options: [
                  { id: 'software', text: 'حلول البرمجيات', nextQuestion: 'software-details' },
                  { id: 'hardware', text: 'منتجات الأجهزة', nextQuestion: 'hardware-details' }
                ]
              }
            },
            fa: {
              title: 'محصولات ما',
              content: 'محصولات نوآورانه ما را کشف کنید که برای ساده‌سازی جریان کار و افزایش بهره‌وری طراحی شده‌اند.',
              hasLetter: false,
              subQuestion: {
                question: 'به دنبال چه نوع محصولی هستید؟',
                options: [
                  { id: 'software', text: 'راه‌حل‌های نرم‌افزاری', nextQuestion: 'software-details' },
                  { id: 'hardware', text: 'محصولات سخت‌افزاری', nextQuestion: 'hardware-details' }
                ]
              }
            }
          },
          contact: {
            en: {
              title: 'Contact Us',
              content: 'Get in touch with our team. We are here to help and answer any questions you may have.',
              hasLetter: true,
              letterContent: 'We look forward to hearing from you and discussing how we can work together.',
              subQuestion: null
            },
            ar: {
              title: 'اتصل بنا',
              content: 'تواصل مع فريقنا. نحن هنا للمساعدة والإجابة على أي أسئلة قد تكون لديك.',
              hasLetter: true,
              letterContent: 'نتطلع إلى سماع رأيك ومناقشة كيف يمكننا العمل معاً.',
              subQuestion: null
            },
            fa: {
              title: 'تماس با ما',
              content: 'با تیم ما در تماس باشید. ما اینجا هستیم تا کمک کنیم و به سوالات شما پاسخ دهیم.',
              hasLetter: true,
              letterContent: 'مشتاقانه منتظر شنیدن نظر شما و بحث در مورد چگونگی همکاری هستیم.',
              subQuestion: null
            }
          }
        };
        
        setTimeout(() => {
          const content = fallbackContent[question]?.[language] || fallbackContent[question]?.en;
          setCurrentContent(content);
          setIsLoaded(true);
          setLoading(false);
          
          if (content?.hasLetter) {
            setTimeout(() => setShowLetter(true), 500);
          }
        }, 300);
      }
    };

    if (question) {
      loadSubPageContent();
    }
  }, [question, language]);

  const handleOptionClick = async (option) => {
    try {
      // Try to navigate using API first
      const response = await ApiService.navigateToNextQuestion(question, option.id, language);
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
      <div className="subpage-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  if (error && !currentContent) {
    return (
      <div className="subpage-container">
        <div className="error-message">
          <h2>Unable to load content</h2>
          <p>{error}</p>
          <button onClick={onGoBack}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="subpage-container">
      <div className={`subpage-content ${isLoaded ? 'loaded' : ''}`}>
        <button onClick={onGoBack} className="back-button">
          ← Back
        </button>
        
        <div className="content-header">
          <h1 className="content-title">{currentContent.title}</h1>
          <p className="content-description">{currentContent.content}</p>
        </div>
        
        {currentContent.hasLetter && (
          <div className={`letter-section ${showLetter ? 'visible' : ''}`}>
            <svg 
              width="350" 
              height="250" 
              viewBox="0 0 350 250" 
              className="content-letter-svg"
              loading="lazy"
            >
              <rect x="25" y="25" width="300" height="200" fill="#f8f8f8" stroke="#ddd" strokeWidth="2" rx="10"/>
              <rect x="35" y="35" width="280" height="180" fill="#ffffff" stroke="#eee" strokeWidth="1" rx="8"/>
              <text x="175" y="130" textAnchor="middle" className="letter-content-text">
                {currentContent.letterContent}
              </text>
            </svg>
          </div>
        )}
        
        {currentContent.subQuestion && (
          <div className="sub-question-section">
            <h3 className="sub-question-title">{currentContent.subQuestion.question}</h3>
            <div className="sub-options-container">
              {currentContent.subQuestion.options.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className="sub-option-button"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="sub-option-text">{option.text}</span>
                  <span className="sub-option-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubPage;

