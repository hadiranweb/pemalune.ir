import React from 'react';
import useLazyLoad from '../hooks/useLazyLoad';
import './LazyImage.css';

const LazyImage = ({ src, alt, className, width, height, children, ...props }) => {
  const { elementRef, isVisible, isLoaded } = useLazyLoad({ 
    threshold: 0.1, 
    delay: 300 
  });

  return (
    <div 
      ref={elementRef} 
      className={`lazy-image-container ${className || ''}`}
      style={{ width, height }}
      {...props}
    >
      {!isVisible && (
        <div className="lazy-placeholder">
          <div className="lazy-spinner"></div>
          <span>Loading...</span>
        </div>
      )}
      
      {isVisible && (
        <div className={`lazy-content ${isLoaded ? 'loaded' : 'loading'}`}>
          {src ? (
            <img 
              src={src} 
              alt={alt} 
              className="lazy-image"
              loading="lazy"
              onLoad={() => {/* Additional load handling if needed */}}
            />
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
};

export default LazyImage;

