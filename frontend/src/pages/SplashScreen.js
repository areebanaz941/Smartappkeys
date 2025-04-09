import React, { useState, useEffect } from 'react';

// Define exact color palette from provided images
const colors = {
  brightBlue: '#2B6CC2',     // Bright blue from logo background
  lightBlue: '#6889BD',      // Lighter blue from palette
  brightGreen: '#31D33A',    // Bright green from logo
  lightGreen: '#8AE35A',     // Light green from palette
  darkGreen: '#3A6135',      // Dark green from palette
  white: '#FFFFFF'           // White
};

/**
 * SplashScreen component
 * 
 * Shows animated logo and Continue button
 */
const SplashScreen = ({ onContinue }) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    // After initial load, start animations
    const animationTimer = setTimeout(() => {
      setAnimationComplete(true);
      
      // After animation completes, show continue button
      setTimeout(() => {
        setShowContinue(true);
      }, 500);
    }, 2000);
    
    return () => clearTimeout(animationTimer);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white overflow-hidden">
      <div className={`relative flex flex-col items-center transition-all duration-1000 ease-in-out 
                      ${animationComplete ? 'scale-105' : 'scale-100'}`}>
        
        {/* Animated Logo */}
<div className="relative w-40 h-40 mb-6">
  {/* Italian Logo */}
  <div
    className="absolute inset-0 flex items-center justify-center"
    style={{ 
      animation: 'fadeInOut 4s infinite',
      opacity: 0
    }}
  >
    <img 
      src="/italLogo-removebg-preview.png"
      alt="Italian Smart AppKey Logo"
      className="w-4/5 h-4/5 object-contain"
    />
  </div>
  
  {/* English Logo */}
  <div
    className="absolute inset-0 flex items-center justify-center"
    style={{ 
      animation: 'fadeInOut 4s infinite 2s',
      opacity: 0
    }}
  >
    <img 
      src="/EngLogo-removebg-preview.png"
      alt="English Smart AppKey Logo"
      className="w-4/5 h-4/5 object-contain"
    />
  </div>
</div>
        
        {/* Text Content */}
        <h1 className="text-2xl md:text-3xl font-bold text-center" style={{ color: colors.brightBlue }}>
          San Lorenzo Nuovo<br />Smart AppKey
        </h1>
        <p className="text-center mt-2" style={{ color: colors.brightBlue }}>
          Connection, the KEY to our community
        </p>
        
        {/* Continue button - fades in after animation completes */}
        <button
          onClick={onContinue}
          className={`mt-10 px-8 py-3 rounded-full text-white font-medium transition-all transform hover:scale-105 ${
            showContinue ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            backgroundColor: colors.brightGreen,
            transition: 'opacity 0.5s ease-in-out, transform 0.2s ease-in-out'
          }}
        >
          Continue
        </button>
      </div>
      
      {/* Loading dots shown until continue button appears */}
      {!showContinue && (
        <div className="absolute bottom-20 flex space-x-3 animate-fadeIn">
          <div className="h-3 w-3 rounded-full animate-bounce" 
               style={{ backgroundColor: colors.brightGreen, animationDelay: '0.1s' }}></div>
          <div className="h-3 w-3 rounded-full animate-bounce" 
               style={{ backgroundColor: colors.brightGreen, animationDelay: '0.2s' }}></div>
          <div className="h-3 w-3 rounded-full animate-bounce" 
               style={{ backgroundColor: colors.brightGreen, animationDelay: '0.3s' }}></div>
        </div>
      )}
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(10deg); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes fadeInOut {
    0%, 100% { opacity: 0; transform: scale(0.95); }
    25%, 75% { opacity: 1; transform: scale(1); }
    50% { opacity: 0; transform: scale(0.95); }
  }
      `}</style>
    </div>
  );
};

export default SplashScreen;