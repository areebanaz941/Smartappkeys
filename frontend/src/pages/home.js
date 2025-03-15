import React, { useState, useEffect } from 'react';
import { Search, Menu, X, MapPin, Star, Camera, User, XCircle } from 'lucide-react';
import { AuthPage } from './LoginRegistrationPages'; 
import { Link } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';

// Import translations
import enTranslations from '../i18n/locales/en.json';
import itTranslations from '../i18n/locales/it.json';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [translations, setTranslations] = useState(enTranslations);
  
  // Update to handle both login and registration in one modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  // Load saved language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage === 'it') {
      setTranslations(itTranslations);
    }
  }, []);

  const handleLanguageChange = (language) => {
    setTranslations(language === 'en' ? enTranslations : itTranslations);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleExploreClick = () => {
    // If you want to pass the search query to the map page, you can do it via state
    // This is an example using the Link component instead of programmatic navigation
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

  return (
    <div className="min-h-screen bg-white relative">
      {/* Auth Modal - Now supports both login and signup */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <AuthPage 
              initialView={authMode} 
              onClose={closeAuthModal}
            />
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="bg-yellowgreen shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="/San_Lorenzo_Nuovo_Smart_AppKey_Logo.png" 
                  alt="San Lorenzo Nuovo Smart AppKey Logo" 
                  className="h-12 w-auto mr-1" 
                />
                <span className="text-[#032c60] font-bold text-xl md:text-2xl">San Lorenzo Nuovo Smart AppKey</span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a href="/home" className="text-[#032c60] border-b-2 border-[#032c60] px-3 pt-5 pb-2 font-medium text-sm">
                  {header.home}
                </a>
                <a href="/map" className="text-[#6b7280] hover:text-[#032c60] px-3 pt-5 pb-2 font-medium text-sm">
                  {header.destinations}
                </a>
                <a href="/review" className="text-[#6b7280] hover:text-[#032c60] px-3 pt-5 pb-2 font-medium text-sm">
                  {header.experiences}
                </a>
                <a href="/rewards" className="text-[#6b7280] hover:text-[#032c60] px-3 pt-5 pb-2 font-medium text-sm">
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
                  className="text-[#032c60] px-4 py-2 rounded-full text-sm font-small hover:bg-gray-100 transition-colors"
                >
                  {header.signin}
                </button>
              </div>
              <div className="md:hidden flex items-center ml-4">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-[#6b7280] hover:text-[#032c60]"
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
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <a href="#" className="bg-[#032c60]/10 text-[#032c60] block pl-3 pr-4 py-2 font-medium">
                {header.home}
              </a>
              <a href="#" className="text-[#032c60] hover:bg-gray-50 block pl-3 pr-4 py-2 font-medium">
                {header.destinations}
              </a>
              <a href="#" className="text-[#032c60] hover:bg-gray-50 block pl-3 pr-4 py-2 font-medium">
                {header.experiences}
              </a>
              <a href="#" className="text-[#032c60] hover:bg-gray-50 block pl-3 pr-4 py-2 font-medium">
                {header.rewards}
              </a>
              {/* Language selector for mobile */}
              <div className="px-3 py-2">
                <LanguageSelector onSelectLanguage={handleLanguageChange} />
              </div>
              <div className="px-3 py-2">
                <input
                  type="text"
                  placeholder={header.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none"
                />
                <Search className="absolute left-6 top-[16.5rem] h-4 w-4 text-[#6b7280]" />
              </div>
              <div className="px-3 py-2 space-y-2">
                <button 
                  onClick={() => openAuthModal('login')}
                  className="w-full bg-white border border-[#032c60] text-[#032c60] px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {header.signin}
                </button>
                <button 
                  onClick={() => openAuthModal('signup')}
                  className="w-full bg-[#032c60] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#16a34a] transition-colors"
                >
                  {header.signup}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gray-100">
        <div className="h-96 md:h-[32rem] w-full overflow-hidden bg-midnightblue">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-80"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {hero.welcome}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
              {hero.description}
            </p>
            <div className="max-w-xl mx-auto bg-yellowgreen p-4 rounded-2xl shadow-md">
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder={header.searchPlaceholder}
                  className="flex-grow px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#032c60]"
                />
                <Link 
                  to="/map" 
                  className="bg-[#032c60] hover:bg-[#16a34a] text-white px-6 py-3 rounded-full font-medium transition-colors"
                >
                  {hero.exploreNow}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section 1: Local Insights */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#032c60] mb-4">{features.title}</h2>
            <p className="text-[#6b7280] max-w-3xl mx-auto">
              {features.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/board.jpeg" 
                  alt="Map features" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-[#032c60] mr-2" />
                  <h3 className="text-lg font-semibold text-[#032c60]">{features.smartTravel.title}</h3>
                </div>
                <p className="text-[#6b7280]">
                  {features.smartTravel.description}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/sea.jpeg" 
                  alt="Personalized recommendations" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-[#032c60] mr-2" />
                  <h3 className="text-lg font-semibold text-[#032c60]">{features.experiences.title}</h3>
                </div>
                <p className="text-[#6b7280]">
                  {features.experiences.description}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/skywater.jpeg" 
                  alt="Local guide insights" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-[#032c60] mr-2" />
                  <h3 className="text-lg font-semibold text-[#032c60]">{features.rewards.title}</h3>
                </div>
                <p className="text-[#6b7280]">
                  {features.rewards.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#032c60] mb-4">{testimonials.title}</h2>
            <p className="text-[#6b7280] max-w-3xl mx-auto">
              {testimonials.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-[#1f2937]">Traveler {i}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[#6b7280]">
                  {testimonials.quote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Newsletter Section */}
      <div className="bg-[#032c60] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-white mb-2">{newsletter.title}</h2>
              <p className="text-white/80">
                {newsletter.subtitle}
              </p>
            </div>
            <div className="md:w-1/2 flex">
              <input
                type="email"
                placeholder={newsletter.placeholder}
                className="flex-grow px-4 py-3 rounded-l-full focus:outline-none"
              />
              <button className="bg-white text-[#032c60] px-6 py-3 rounded-r-full font-medium hover:bg-gray-100 transition-colors">
                {newsletter.button}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Smart Travel</h3>
              <p className="mb-4 text-gray-400">{footer.description}</p>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
                <div className="h-8 w-8 rounded-full bg-[#1877F2]"></div>
                <div className="h-8 w-8 rounded-full bg-[#1DA1F2]"></div>
                <div className="h-8 w-8 rounded-full bg-[#E1306C]"></div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">{footer.explore}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.destinations}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.experiences}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.travelGuides}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.localInsights}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">{footer.company}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.aboutUs}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.careers}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.blog}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.press}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">{footer.support}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.helpCenter}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.contactUs}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.privacyPolicy}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{footer.links.termsOfService}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;