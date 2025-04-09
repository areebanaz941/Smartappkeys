import React, { createContext, useState, useCallback } from 'react';
import enTranslations from '../i18n/locales/en.json';
import itTranslations from '../i18n/locales/it.json';

// Define available languages
const translations = {
  en: enTranslations,
  it: itTranslations
};

export const I18nContext = createContext({
  language: 'en',
  t: () => '',
  changeLanguage: () => {}
});

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  // Translation function
  const t = useCallback((key, defaultValue = '') => {
    // Split the key into nested object access
    const keys = key.split('.');
    
    // Get the current language translations
    let translation = translations[language];
    
    // Navigate through nested keys
    for (let nestedKey of keys) {
      translation = translation?.[nestedKey];
      if (translation === undefined) return defaultValue;
    }
    
    return translation || defaultValue;
  }, [language]);

  // Change language method
  const changeLanguage = useCallback((newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    }
  }, []);

  return (
    <I18nContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};