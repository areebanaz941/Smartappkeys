import React, { useState, useEffect } from 'react';
import { Search, Menu, X, MapPin, Bike, List, Route, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import enTranslations from '../i18n/locales/en.json';
import itTranslations from '../i18n/locales/it.json';

// Define colors 
const colors = {
  brightBlue: '#3b82f6',
  brightGreen: '#22c55e'
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [translations, setTranslations] = useState(enTranslations);

  // Load saved language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage === 'it') {
      setTranslations(itTranslations);
    }
  }, []);

  const handleLanguageChange = (language) => {
    // Update translations based on selected language
    const selectedTranslations = language === 'en' ? enTranslations : itTranslations;
    setTranslations(selectedTranslations);
    
    // Save language preference
    localStorage.setItem('preferredLanguage', language);
  };

  const openAuthModal = (type) => {
    // Implement auth modal opening logic
    console.log(`Opening ${type} modal`);
  };

  // Destructure header translations for easier access
  const { header } = translations;

  return (
    <header className="bg-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="San Lorenzo Nuovo Logo" 
                className="h-16 w-auto mr-3" 
              />
              <span className="font-bold text-lg text-[#22c55e]">San Lorenzo Nuovo Explorer</span>
            </Link>
          </div>
          
          <div className="hidden md:ml-6 md:flex md:space-x-8">
            <a href="/home" style={{ color: colors.brightBlue, borderColor: colors.brightBlue }} className="border-b-2 px-3 pt-5 pb-2 font-medium text-sm">
              {header.home}
            </a>
            <a href="/explorer" className="text-gray-600 hover:text-blue-800 px-3 pt-5 pb-2 font-medium text-sm">
              {header.destinations}
            </a>
            <a href="/review" className="text-gray-600 hover:text-blue-800 px-3 pt-5 pb-2 font-medium text-sm">
              {header.experiences}
            </a>
            <a href="/rewards" className="text-gray-600 hover:text-blue-800 px-3 pt-5 pb-2 font-medium text-sm">
              {header.rewards}
            </a>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Selector */}
              <LanguageSelector onSelectLanguage={handleLanguageChange} />
              
              {/* Sign In Button - Updated with exact green color */}
              <button 
                onClick={() => openAuthModal('login')}
                style={{ backgroundColor: colors.brightGreen }}
                className="text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-colors"
              >
                {header.signin}
              </button>
            </div>
            <div className="md:hidden flex items-center ml-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-800"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;