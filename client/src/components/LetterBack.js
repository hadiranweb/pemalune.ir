import React, { useState, useEffect } from 'react';
import LazyImage from './LazyImage';
import './LetterBack.css';

const LetterBack = ({ onLanguageSelect }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLanguageClick = (language) => {
    onLanguageSelect(language);
  };

  const languages = [
    { code: 'ar', name: 'العربية', displayName: 'Arabic' },
    { code: 'fa', name: 'فارسی', displayName: 'Persian' },
    { code: 'en', name: 'English', displayName: 'English' }
  ];

  return (
    <div className="letter-container">
      <div className={`letter-back ${isVisible ? 'visible' : ''}`}>
        <LazyImage className="letter-svg-container" width="400" height="300">
          <svg 
            width="400" 
            height="300" 
            viewBox="0 0 400 300" 
            className="letter-svg"
            loading="lazy"
          >
            {/* Enhanced letter envelope back design */}
            <defs>
              <linearGradient id="backGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#f8f8f8" />
                <stop offset="100%" stopColor="#e8e8e8" />
              </linearGradient>
              <radialGradient id="centerGlow" cx="50%" cy="40%" r="40%">
                <stop offset="0%" stopColor="#667eea" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#764ba2" stopOpacity="0.1" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <filter id="backShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#00000020"/>
              </filter>
            </defs>
            
            {/* Main envelope back */}
            <rect x="50" y="50" width="300" height="200" 
                  fill="url(#backGradient)" 
                  stroke="#ddd" strokeWidth="2" rx="10"
                  filter="url(#backShadow)"/>
            <rect x="60" y="60" width="280" height="180" 
                  fill="#ffffff" stroke="#eee" strokeWidth="1" rx="8"/>
            
            {/* Decorative center glow */}
            <rect x="60" y="60" width="280" height="180" 
                  fill="url(#centerGlow)" rx="8"/>
            
            {/* Decorative elements with animation */}
            <g className="floating-elements">
              <circle cx="200" cy="100" r="30" fill="#667eea" opacity="0.1">
                <animate attributeName="r" values="30;35;30" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="200" cy="100" r="20" fill="#667eea" opacity="0.2">
                <animate attributeName="r" values="20;25;20" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="200" cy="100" r="10" fill="#667eea" opacity="0.3">
                <animate attributeName="r" values="10;15;10" dur="1.5s" repeatCount="indefinite"/>
              </circle>
            </g>
            
            {/* Title text with better styling */}
            <text x="200" y="140" textAnchor="middle" className="title-text">
              Select Your Language
            </text>
            <text x="200" y="160" textAnchor="middle" className="subtitle-text">
              اختر لغتك | زبان خود را انتخاب کنید
            </text>
          </svg>
        </LazyImage>
        
        <div className="language-options">
          {languages.map((lang, index) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageClick(lang.code)}
              className="language-button"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="language-content">
                <span className="language-native">{lang.name}</span>
                <span className="language-english">({lang.displayName})</span>
              </div>
              <span className="language-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LetterBack;

