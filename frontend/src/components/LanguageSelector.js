import React, { useState, useEffect } from 'react';

const LanguageSelector = ({ onSelectLanguage }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load saved language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferredLanguage', language);
    
    // Call the callback function to notify parent components
    if (onSelectLanguage) {
      onSelectLanguage(language);
    }
    
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-1 text-[#032c60] px-3 py-2 rounded-full text-sm hover:bg-gray-100 transition-colors"
      >
        <span>{currentLanguage === 'en' ? '🇬🇧' : '🇮🇹'}</span>
        <span className="font-medium">{currentLanguage === 'en' ? 'EN' : 'IT'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg z-20">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
              currentLanguage === 'en' ? 'bg-gray-100' : ''
            }`}
          >
            <span className="mr-2">🇬🇧</span> English
          </button>
          <button
            onClick={() => handleLanguageChange('it')}
            className={`flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
              currentLanguage === 'it' ? 'bg-gray-100' : ''
            }`}
          >
            <span className="mr-2">🇮🇹</span> Italiano
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;