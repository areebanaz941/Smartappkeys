import React, { useState } from 'react';
import { MapPin, Star, User, ChevronRight, ArrowRight } from 'lucide-react';

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
 * OnboardingScreens component
 * 
 * Displays a sequence of cards with "Next" buttons
 * that guide the user through app features
 */
const OnboardingScreens = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [animateExit, setAnimateExit] = useState(false);

  // Onboarding content - each card in the sequence
  const onboardingContent = [
    {
      title: "Discover Local Gems",
      description: "Find hidden spots and unique experiences recommended by locals.",
      icon: <MapPin size={32} color={colors.brightGreen} />,
      image: "/discover.jpg"
    },
    {
      title: "Create Your Journey",
      description: "Plan personalized itineraries based on your interests and preferences.",
      icon: <Star size={32} color={colors.brightGreen} />,
      image: "/journey.jpg"
    },
    {
      title: "Connect with Locals",
      description: "Get insider tips and meet friendly locals who share your passions.",
      icon: <User size={32} color={colors.brightGreen} />,
      image: "/connect.jpg"
    }
  ];

  const handleNext = () => {
    if (currentPage < onboardingContent.length - 1) {
      // Animate exit, then switch to next page
      setAnimateExit(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setAnimateExit(false);
      }, 300);
    } else {
      // On last page, call the completion function
      onComplete();
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  const currentContent = onboardingContent[currentPage];
  
  return (
    <div className="h-screen w-full flex flex-col bg-white">
      {/* Progress indicator */}
      <div className="flex w-full h-1 bg-gray-200">
        {onboardingContent.map((_, index) => (
          <div 
            key={index}
            className="h-full transition-all duration-300"
            style={{ 
              width: `${100 / onboardingContent.length}%`, 
              backgroundColor: index <= currentPage ? colors.brightGreen : 'transparent'
            }}
          ></div>
        ))}
      </div>
      
      {/* Card content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div 
          className={`w-full max-w-md transition-all duration-300 ${
            animateExit ? 'opacity-0 transform translate-x-10' : 'opacity-100 transform translate-x-0'
          }`}
        >
          {/* Image */}
          <div className="w-full h-48 mb-8 rounded-xl overflow-hidden">
            <img 
              src={currentContent.image || "/api/placeholder/400/200"} 
              alt={currentContent.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div 
              className="p-4 rounded-full" 
              style={{ backgroundColor: `${colors.brightGreen}20` }}
            >
              {currentContent.icon}
            </div>
          </div>
          
          {/* Content */}
          <h2 
            className="text-2xl font-bold mb-4 text-center" 
            style={{ color: colors.brightBlue }}
          >
            {currentContent.title}
          </h2>
          
          <p className="text-gray-600 text-center mb-10">
            {currentContent.description}
          </p>
          
          {/* Next Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-full text-white font-medium flex items-center transition-all transform hover:scale-105"
              style={{ backgroundColor: colors.brightGreen }}
            >
              {currentPage < onboardingContent.length - 1 ? 'Next' : 'Get Started'}
              <ArrowRight className="ml-2" size={18} />
            </button>
            
            {/* Skip button */}
            {currentPage < onboardingContent.length - 1 && (
              <button
                onClick={skipOnboarding}
                className="mt-4 text-sm text-gray-500 hover:text-gray-800"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center mb-10">
        {onboardingContent.map((_, index) => (
          <button 
            key={index}
            className="h-2 w-2 rounded-full mx-1 transition-all duration-300"
            style={{ 
              backgroundColor: index === currentPage ? colors.brightGreen : '#e0e0e0'
            }}
            onClick={() => setCurrentPage(index)}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default OnboardingScreens;