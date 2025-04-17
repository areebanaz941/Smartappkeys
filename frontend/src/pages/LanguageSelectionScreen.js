import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const LanguageSelectionScreen = ({ onLanguageSelect }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Load saved language if exists
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng') || localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      if (savedLanguage.startsWith('it')) {
        setSelectedLanguage('it');
      } else {
        setSelectedLanguage('en');
      }
    }
  }, []);

  const handleContinue = () => {
    // Save to localStorage (for compatibility with existing code)
    localStorage.setItem('preferredLanguage', selectedLanguage);
    
    // Change language in i18n
    i18n.changeLanguage(selectedLanguage);
    
    // Call the callback with the selected language
    onLanguageSelect(selectedLanguage);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-6">
      {/* Content */}
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-indigo-900 mb-2 text-center">
          {selectedLanguage === 'en' ? 'Select preferred language' : 'Seleziona la lingua preferita'}
        </h1>
        <p className="text-gray-600 text-center mb-8">
          {selectedLanguage === 'en' 
            ? 'Choose your language for a personalised experience.' 
            : 'Scegli la tua lingua per un\'esperienza personalizzata.'}
        </p>
        
        {/* Language options */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setSelectedLanguage('en')}
            className={`p-6 rounded-lg text-center border ${
              selectedLanguage === 'en' 
                ? 'border-green-500 bg-white' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="font-bold text-indigo-900 mb-1">English</div>
            <div className="text-sm text-gray-500">English</div>
          </button>
          
          <button
            onClick={() => setSelectedLanguage('it')}
            className={`p-6 rounded-lg text-center border ${
              selectedLanguage === 'it' 
                ? 'border-green-500 bg-white' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="font-bold text-indigo-900 mb-1">Italiano</div>
            <div className="text-sm text-gray-500">Italian</div>
          </button>
        </div>
        
        {/* Continue button */}
        <button
          onClick={handleContinue}
          className="w-full py-4 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors"
        >
          {selectedLanguage === 'en' ? 'Continue' : 'Continua'}
        </button>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-between px-6">
        <div className="text-sm text-gray-500">© 2025 SmartAppKey</div>
        <button className="bg-blue-900 text-white px-4 py-1 text-sm rounded">Admin</button>
      </div>
    </div>
  );
};

export default LanguageSelectionScreen;