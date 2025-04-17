import React, { useState, useEffect } from 'react';
import { Search, Menu, X, MapPin, Star, Camera, User, XCircle, ChevronRight } from 'lucide-react';
import { AuthPage } from './LoginRegistrationPages'; 
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import LanguageSelectionScreen from './LanguageSelectionScreen';

// Import translations
import enTranslations from '../i18n/locales/en.json';
import itTranslations from '../i18n/locales/it.json';

// Define exact color palette from provided images
const colors = {
  brightBlue: '#2B6CC2',     // Bright blue from logo background
  lightBlue: '#6889BD',      // Lighter blue from palette
  brightGreen: '#31D33A',    // Bright green from logo
  lightGreen: '#8AE35A',     // Light green from palette
  darkGreen: '#3A6135',      // Dark green from palette
  white: '#FFFFFF',          // White
  honeydew: 'rgb(199, 250, 202)', // Honeydew background color
};

const HomePage = () => {
  // App flow states - MODIFIED to show splash first, then language selection
  const [currentStep, setCurrentStep] = useState('splash'); // 'splash', 'language', 'onboarding', 'login', 'main'
  const [onboardingPage, setOnboardingPage] = useState(0);

  // Animation states
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);
  const [animatedCards, setAnimatedCards] = useState([]);
  
  // Other app states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [translations, setTranslations] = useState(enTranslations);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  // Load saved language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage === 'it') {
      setTranslations(itTranslations);
    }
    
    // Logo animation timing
    setTimeout(() => {
      setSplashAnimationComplete(true);
    }, 2000);
  }, []);

  // Animate cards sequentially
  useEffect(() => {
    if (currentStep === 'main') {
      // Animate cards one by one with a delay
      const animateCards = async () => {
        for (let i = 0; i < 3; i++) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setAnimatedCards(prev => [...prev, i]);
        }
      };
      
      animateCards();
    }
  }, [currentStep]);

  const handleLanguageChange = (language) => {
    setTranslations(language === 'en' ? enTranslations : itTranslations);
    localStorage.setItem('preferredLanguage', language);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setCurrentStep('login');
  };

  const closeAuthModal = () => {
    setCurrentStep('main');
  };

  // Destructure translations for easier access
  const {
    header,
    hero,
    features,
    testimonials,
    newsletter,
    footer
  } = translations;

  // Onboarding content based on selected language
  const onboardingContent = [
    {
      title: features?.smartTravel?.title || "Smart Travel",
      description: features?.smartTravel?.description || 
        "Travel effortlessly with intelligent and intuitive maps always at your fingertips. Customise your trip according to your needs and desires with search filters and customisation features that allow you to find the experiences, places and venues that suit you best.",
      icon: <img 
        src="/board.jpeg" 
        alt="Road sign for San Lorenzo Nuovo" 
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
    },
    {
      title: features?.experiences?.title || "Try Our Experiences",
      description: features?.experiences?.description || 
        "You will get access to exclusive discounts, special offers, reserved benefits and promotions, fun challenges, and games dedicated to sustainability and discovering the territory.",
      icon: <img 
        src="/sea.jpeg" 
        alt="Lake view with cloudy sky" 
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
    },
    {
      title: features?.rewards?.title || "Unlock Rewards & Special Perks",
      description: features?.rewards?.description || 
        "You will gain access to exclusive discounts, special offers, reserved benefits and promotions, fun challenges and games dedicated to sustainability and discovery.",
      icon: <img 
        src="/skywater.jpeg" 
        alt="Lake landscape with sky reflection" 
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
    }
  ];

  // Splash Screen Component - This is now the first screen as requested
  if (currentStep === 'splash') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white overflow-hidden">
        <div className="flex flex-col items-center">
          {/* App Logo */}
          <img 
            src="/logo.png" 
            alt="San Lorenzo Nuovo Logo" 
            className="w-32 h-32 mb-4"
          />
          
          {/* App Name and Tagline */}
          <h1 className="text-4xl font-bold text-center text-blue-600 mb-1">
            San Lorenzo Nuovo
          </h1>
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
            Smart AppKey
          </h2>
          <p className="text-lg text-center text-blue-600 mb-10">
            Connection, the KEY to our community
          </p>
          
          {/* Continue button */}
          <button
            onClick={() => setCurrentStep('language')}
            className="mt-8 px-12 py-3 rounded-full text-white font-medium transition-all transform hover:scale-105"
            style={{ backgroundColor: colors.brightGreen }}
          >
            Continue
          </button>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-6 text-center w-full">
          <p className="text-sm text-gray-500">© 2025 SmartAppKey</p>
        </div>
      </div>
    );
  }

  // Language Selection Screen - Now the second screen after splash
  if (currentStep === 'language') {
    return (
      <LanguageSelectionScreen 
        onLanguageSelect={(lang) => {
          handleLanguageChange(lang);
          setCurrentStep('onboarding');
        }}
      />
    );
  }

  // Onboarding Screens - Updated for better mobile responsiveness
  if (currentStep === 'onboarding') {
    const currentContent = onboardingContent[onboardingPage];
    
    return (
      <div className="h-[85vh] w-full sm:w-3/4 md:w-2/3 lg:w-1/3 mx-auto my-auto inset-0 absolute z-10 flex items-center justify-center rounded-xl shadow-2xl">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          {currentContent.icon}
        </div>
        
        {/* Centered content container */}
        <div className="relative z-10 w-full px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg w-full mx-auto" 
               style={{ 
                 maxWidth: '100%', 
                 height: 'auto', 
                 minHeight: '30vh',
                 display: 'flex', 
                 flexDirection: 'column', 
                 justifyContent: 'bottom' 
               }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-center text-blue-600">
              {currentContent.title}
            </h2>
            
            <p className="text-sm sm:text-base text-gray-600 text-center max-w-xs mx-auto mb-4 sm:mb-6">
              {currentContent.description}
            </p>
            
            {/* Navigation buttons */}
            <div className="flex flex-col items-center mt-auto">
              <button
                onClick={() => {
                  if (onboardingPage < onboardingContent.length - 1) {
                    setOnboardingPage(prev => prev + 1);
                  } else {
                    setCurrentStep('login');
                  }
                }}
                className="w-full py-2 sm:py-3 rounded-full text-white font-medium bg-green-500 hover:bg-green-600 transition-colors"
              >
                {onboardingPage < onboardingContent.length - 1 
                  ? (localStorage.getItem('preferredLanguage') === 'it' ? 'Avanti' : 'Next')
                  : (localStorage.getItem('preferredLanguage') === 'it' ? 'Inizia' : 'Start')}
              </button>
              
              {/* Skip button for first two screens */}
              {onboardingPage < onboardingContent.length - 1 && (
                <button
                  onClick={() => setCurrentStep('login')}
                  className="mt-3 text-gray-500 hover:text-gray-800"
                >
                  {localStorage.getItem('preferredLanguage') === 'it' ? 'Salta' : 'Skip'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login/Registration Modal
  if (currentStep === 'login') {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
        <div className="relative w-full max-w-md animate-scaleIn">
          <AuthPage 
            initialView={authMode} 
            onClose={closeAuthModal}
          />
        </div>
      </div>
    );
  }

  // Main App Content
  return (
    <div className="min-h-screen bg-white relative">
      {/* Navigation Bar - Updated with mobile responsiveness */}
      <nav style={{ backgroundColor: colors.white }} className="shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                {/* Logo in nav bar */}
                <div className="flex items-center">
                  <Link to="/" className="flex items-center">
                    <img 
                      src="/logo.png" 
                      alt="San Lorenzo Nuovo Logo" 
                      className="h-10 sm:h-12 md:h-16 w-auto mr-2 sm:mr-3" 
                    />
                    <span className="font-bold text-sm sm:text-base md:text-lg text-[#22c55e] truncate">
                      <span className="hidden xs:inline">San Lorenzo Nuovo </span>Explorer
                    </span>
                  </Link>
                </div>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a href="/home" style={{ color: colors.brightBlue, borderColor: colors.brightBlue }} className="border-b-2 px-3 pt-5 pb-2 font-medium text-sm">
                  {header.home}
                </a>
                <a href="/explorer" className="text-gray-600 hover:text-blue-800 px-3 pt-5 pb-2 font-medium text-sm">
                  {header.destinations}
                </a>
                <a href="/bikerental" className="text-gray-600 hover:text-blue-800 px-3 pt-5 pb-2 font-medium text-sm">
                  {header.experiences}
                </a>
                <a href="/rewards" className="text-gray-600 hover:text-blue-800 px-3 pt-5 pb-2 font-medium text-sm">
                  {header.rewards}
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <div className="hidden md:flex items-center space-x-4">
                {/* Language Selector */}
                <LanguageSelector onSelectLanguage={handleLanguageChange} />
                
                {/* Sign In Button */}
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
        
        {/* Mobile menu - Enhanced with better mobile styling */}
        {isMenuOpen && (
          <div className="md:hidden animate-slideDown">
            <div className="pt-2 pb-3 space-y-1">
              <a href="#" style={{ backgroundColor: `${colors.brightBlue}10`, color: colors.brightBlue }} className="block pl-3 pr-4 py-2 font-medium">
                {header.home}
              </a>
              <a href="#" style={{ color: colors.brightBlue }} className="hover:bg-gray-50 block pl-3 pr-4 py-2 font-medium">
                {header.destinations}
              </a>
              <a href="#" style={{ color: colors.brightBlue }} className="hover:bg-gray-50 block pl-3 pr-4 py-2 font-medium">
                {header.experiences}
              </a>
              <a href="#" style={{ color: colors.brightBlue }} className="hover:bg-gray-50 block pl-3 pr-4 py-2 font-medium">
                {header.rewards}
              </a>
              
              {/* Mobile search */}
              <div className="relative px-3 py-2">
                <input
                  type="text"
                  placeholder={header.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none"
                />
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
              </div>
              
              {/* Language selector for mobile */}
              <div className="px-3 py-2">
                <LanguageSelector onSelectLanguage={handleLanguageChange} />
              </div>
              
              <div className="px-3 py-2 space-y-2">
                <button 
                  onClick={() => openAuthModal('login')}
                  style={{ backgroundColor: colors.brightGreen }}
                  className="w-full text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-colors"
                >
                  {header.signin}
                </button>
                <button 
                  onClick={() => openAuthModal('signup')}
                  className="w-full bg-white border border-blue-800 text-blue-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {header.signup}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gray-100 animate-fadeIn">
        <div className="h-64 sm:h-80 md:h-96 lg:h-[32rem] w-full overflow-hidden">
          <img 
            src="/bg2.jpg" 
            alt="Scenic view of San Lorenzo Nuovo" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-80"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-slideUpFade">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
              {hero.welcome}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-4 sm:mb-8 px-2">
              {hero.description}
            </p>
            <div className="max-w-xl mx-auto bg-white p-3 sm:p-4 rounded-2xl shadow-md">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <input 
                  type="text" 
                  placeholder={header.searchPlaceholder}
                  className="flex-grow px-3 sm:px-4 py-2 sm:py-3 border rounded-full focus:outline-none focus:ring-2 text-sm sm:text-base"
                  style={{ focusRing: colors.brightBlue }}
                />
                <Link 
                  to="/explorer" 
                  style={{ backgroundColor: colors.brightGreen }}
                  className="text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium hover:opacity-90 transition-colors text-sm sm:text-base"
                >
                  {hero.exploreNow}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Sections - Updated with mobile responsiveness */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Section 1: Local Insights */}
        <div className="mb-8 sm:mb-16">
          <div className="text-center mb-6 sm:mb-10 animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4" style={{ color: colors.brightBlue, animationDelay: '0.2s' }}>
              {features.title}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-sm sm:text-base">
              {features.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 - Smart Travel */}
            <div 
              className={`bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-700 ease-out
                        ${animatedCards.includes(0) ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              <div className="h-40 sm:h-48 overflow-hidden">
                <img 
                  src="/board.jpeg" 
                  alt="Smart Travel Sign" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" style={{ color: colors.brightGreen }} />
                  <h3 className="text-base sm:text-lg font-semibold" style={{ color: colors.brightBlue }}>
                    {features.smartTravel?.title || "Smart Travel"}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600">
                  {features.smartTravel?.description || "Travel effortlessly with intelligent and intuitive maps always at your fingertips. Customise your trip according to your needs and desires with search filters and customisation features that allow you to find the experiences, places and venues that suit you best."}
                </p>
              </div>
            </div>
            
            {/* Card 2 - Try Our Experiences */}
            <div 
              className={`bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-700 ease-out 
                        ${animatedCards.includes(1) ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="h-40 sm:h-48 overflow-hidden">
                <img 
                  src="/sea.jpeg" 
                  alt="Lake view experience" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-2" style={{ color: colors.brightGreen }} />
                  <h3 className="text-base sm:text-lg font-semibold" style={{ color: colors.brightBlue }}>
                    {features.experiences?.title || "Try Our Experiences"}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600">
                  {features.experiences?.description || "You will get access to exclusive discounts, special offers, reserved benefits and promotions, fun challenges, and games dedicated to sustainability and discovering the territory."}
                </p>
              </div>
            </div>
            
            {/* Card 3 - Unlock Rewards & Special Perks */}
            <div 
              className={`bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-700 ease-out 
                        ${animatedCards.includes(2) ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="h-40 sm:h-48 overflow-hidden">
                <img 
                  src="/skywater.jpeg" 
                  alt="Sky and water view" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" style={{ color: colors.brightGreen }} />
                  <h3 className="text-base sm:text-lg font-semibold" style={{ color: colors.brightBlue }}>
                    {features.rewards?.title || "Unlock Rewards & Special Perks"}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600">
                  {features.rewards?.description || "You will gain access to exclusive discounts, special offers, reserved benefits and promotions, fun challenges and games dedicated to sustainability and discovery."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section - with better mobile responsiveness */}
      <div className="bg-gray-100 py-8 sm:py-12 md:py-16 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4" style={{ color: colors.brightBlue }}>
              {testimonials.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto">
              {testimonials.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-md transform transition-all duration-500 ease-in-out hover:-translate-y-2"
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-200 mr-3 sm:mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Traveler {i}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                  {testimonials.quote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Newsletter Section - Updated with better mobile responsiveness */}
      <div className="py-8 sm:py-12 animate-fadeIn" style={{ backgroundColor: colors.brightBlue, animationDelay: '0.6s' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-6 md:mb-0 text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{newsletter.title}</h2>
              <p className="text-white/80 text-sm sm:text-base">
                {newsletter.subtitle}
              </p>
            </div>
            <div className="w-full md:w-1/2 flex flex-col sm:flex-row">
              <input
                type="email"
                placeholder={newsletter.placeholder}
                className="flex-grow px-4 py-3 rounded-full sm:rounded-l-full sm:rounded-r-none focus:outline-none w-full mb-3 sm:mb-0"
              />
              <button 
                style={{ backgroundColor: colors.brightGreen }} 
                className="text-white px-6 py-3 rounded-full sm:rounded-l-none sm:rounded-r-full font-medium hover:opacity-90 transition-colors w-full sm:w-auto"
              >
                {newsletter.button}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer - Updated with better mobile responsiveness */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Smart Travel</h3>
              <p className="mb-4 text-gray-400 text-sm sm:text-base">{footer.description}</p>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
                <div className="h-8 w-8 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <span className="text-white text-xs">FB</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-[#1DA1F2] flex items-center justify-center">
                  <span className="text-white text-xs">TW</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-[#E1306C] flex items-center justify-center">
                  <span className="text-white text-xs">IG</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-0">
              <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">{footer.explore}</h4>
              <ul className="space-y-2 text-sm sm:text-base">
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.destinations}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.experiences}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.travelGuides}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.localInsights}</a></li>
              </ul>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">{footer.company}</h4>
              <ul className="space-y-2 text-sm sm:text-base">
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.aboutUs}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.careers}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.blog}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.press}</a></li>
              </ul>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">{footer.support}</h4>
              <ul className="space-y-2 text-sm sm:text-base">
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.helpCenter}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.contactUs}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.privacyPolicy}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.termsOfService}</a></li>
              </ul>
            </div>
          </div>
          
          {/* Mobile app links */}
          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-wrap justify-center sm:justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 sm:mb-0 text-center sm:text-left">
              © {new Date().getFullYear()} San Lorenzo Nuovo Smart AppKey. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="flex items-center bg-gray-800 px-4 py-2 rounded-lg text-white text-sm hover:bg-gray-700 transition-colors">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.5,2H8.5L8,2.5v19L8.5,22h9l0.5-0.5v-19L17.5,2z M16,18H10V6h6V18z M12,21c-0.69,0-1.25-0.56-1.25-1.25 s0.56-1.25,1.25-1.25s1.25,0.56,1.25,1.25S12.69,21,12,21z"/>
                </svg>
                Mobile App
              </a>
              <a href="#" className="flex items-center bg-gray-800 px-4 py-2 rounded-lg text-white text-sm hover:bg-gray-700 transition-colors">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,22c-5.52,0-10-4.48-10-10S6.48,2,12,2s10,4.48,10,10S17.52,22,12,22z M17,11.5c0-0.27-0.22-0.5-0.5-0.5 h-3V8c0-0.28-0.22-0.5-0.5-0.5S12.5,7.72,12.5,8v3H9.5C9.22,11,9,11.23,9,11.5S9.22,12,9.5,12h3v3.5c0,0.28,0.22,0.5,0.5,0.5 s0.5-0.22,0.5-0.5V12h3.5C16.78,12,17,11.77,17,11.5z"/>
                </svg>
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom mobile navigation bar - New addition for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-40">
        <div className="flex justify-around items-center py-2">
          <a href="/home" className="flex flex-col items-center p-2">
            <svg className="w-6 h-6" fill="none" stroke={colors.brightBlue} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1" style={{ color: colors.brightBlue }}>Home</span>
          </a>
          <a href="/explorer" className="flex flex-col items-center p-2">
            <MapPin className="w-6 h-6 text-gray-500" />
            <span className="text-xs mt-1 text-gray-500">Explore</span>
          </a>
          <a href="/search" className="flex flex-col items-center p-2">
            <Search className="w-6 h-6 text-gray-500" />
            <span className="text-xs mt-1 text-gray-500">Search</span>
          </a>
          <a href="/profile" className="flex flex-col items-center p-2">
            <User className="w-6 h-6 text-gray-500" />
            <span className="text-xs mt-1 text-gray-500">Profile</span>
          </a>
        </div>
      </div>

      {/* Floating action button for mobile - New addition for mobile */}
      <div className="md:hidden fixed right-4 bottom-20 z-50">
        <button 
          style={{ backgroundColor: colors.brightGreen }} 
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Global Animations */}
      <style jsx global>{`
        /* Base responsive font sizes */
        html {
          font-size: 14px;
        }
        
        @media (min-width: 640px) {
          html {
            font-size: 16px;
          }
        }
        
        /* Extra small screens utility class */
        @media (max-width: 370px) {
          .xs\\:inline {
            display: inline;
          }
          .xs\\:hidden {
            display: none;
          }
        }

        /* Scale In */
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Slide Down */
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Slide Up and Fade */
        @keyframes slideUpFade {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Fade In */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }

        .animate-slideUpFade {
          animation: slideUpFade 0.8s ease-out forwards;
        }

        /* Staggered fade in for mobile cards */
        @media (max-width: 640px) {
          .stagger-fade-in > * {
            opacity: 0;
            transform: translateY(15px);
            animation: fadeInUp 0.5s ease-out forwards;
          }
          
          .stagger-fade-in > *:nth-child(1) { animation-delay: 0.1s; }
          .stagger-fade-in > *:nth-child(2) { animation-delay: 0.2s; }
          .stagger-fade-in > *:nth-child(3) { animation-delay: 0.25s; }
          .stagger-fade-in > *:nth-child(4) { animation-delay: 0.3s; }
        }

        /* Mobile-specific animations */
        @keyframes mobileSlideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-mobileSlideIn {
          animation: mobileSlideIn 0.4s ease-out forwards;
        }

        /* Floating action button animation */
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(49, 211, 58, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(49, 211, 58, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(49, 211, 58, 0); }
        }

        @media (max-width: 768px) {
          button[class*="rounded-full"][style*="background-color: #31D33A"] {
            animation: pulse 2s infinite;
          }
        }
      `}</style>

      {/* Add this to handle safe area on newer iOS devices */}
      <style jsx global>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .md\\:hidden.fixed.bottom-0 {
            padding-bottom: env(safe-area-inset-bottom);
          }
          
          .md\\:hidden.fixed.right-4.bottom-20 {
            bottom: calc(5rem + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;