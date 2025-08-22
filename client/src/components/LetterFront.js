import React, { useState } from 'react';
import LazyImage from './LazyImage';
import ApiService from '../services/api';
import './LetterFront.css';

const LetterFront = ({ onPhoneSubmit }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      setIsFlipping(true);
      
      // Try to store phone number via API
      try {
        await ApiService.storePhoneNumber(phoneNumber);
        console.log('Phone number stored successfully');
      } catch (err) {
        console.error('Failed to store phone number:', err);
        // Continue with the flow even if storage fails
      }
      
      // Wait for animation to complete before calling parent handler
      setTimeout(() => {
        onPhoneSubmit(phoneNumber);
      }, 800); // Match CSS animation duration
    }
  };

  return (
    <div className={`letter-container ${isFlipping ? 'flipping' : ''}`}>
      <div className="letter-card">
        <div className="letter-front-face">
          <LazyImage className="letter-svg-container" width="400" height="300">
            <svg 
              width="400" 
              height="300" 
              viewBox="0 0 400 300" 
              className="letter-svg"
              loading="lazy"
            >
              {/* Enhanced letter envelope design with 3D effect */}
              <defs>
                <linearGradient id="envelopeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#f8f8f8" />
                  <stop offset="100%" stopColor="#e8e8e8" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#00000020"/>
                </filter>
              </defs>
              
              {/* Main envelope body */}
              <rect x="50" y="50" width="300" height="200" 
                    fill="url(#envelopeGradient)" 
                    stroke="#ddd" strokeWidth="2" rx="10"
                    filter="url(#shadow)"/>
              
              {/* Envelope flap with 3D effect */}
              <polygon points="50,50 200,150 350,50" 
                       fill="#f0f0f0" stroke="#ddd" strokeWidth="2"
                       filter="url(#shadow)"/>
              <polygon points="50,50 200,130 350,50" 
                       fill="#f8f8f8" stroke="#ccc" strokeWidth="1"/>
              
              {/* Fold lines */}
              <line x1="50" y1="50" x2="200" y2="150" stroke="#ddd" strokeWidth="2"/>
              <line x1="350" y1="50" x2="200" y2="150" stroke="#ddd" strokeWidth="2"/>
              
              {/* Decorative seal */}
              <circle cx="200" cy="180" r="15" fill="#667eea" opacity="0.8"/>
              <circle cx="200" cy="180" r="10" fill="#764ba2" opacity="0.9"/>
              
              {/* Text content with better typography */}
              <text x="200" y="210" textAnchor="middle" className="letter-text-main">
                Please Enter Your Phone Number
              </text>
              <text x="200" y="230" textAnchor="middle" className="letter-text-sub">
                لطفاً شماره تلفن خود را وارد کنید | يرجى إدخال رقم هاتفك
              </text>
            </svg>
          </LazyImage>
          
          <form onSubmit={handleSubmit} className="phone-form">
            <div className="input-group">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="phone-input"
                required
              />
              <div className="input-underline"></div>
            </div>
            <button type="submit" className="submit-button">
              <span className="button-text">Submit</span>
              <span className="button-icon">→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LetterFront;

