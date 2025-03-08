import React, { useState } from 'react';
import { Search, Menu, X, MapPin, Star, Camera, User, XCircle } from 'lucide-react';
import { AuthPage } from './LoginRegistrationPages'; 
import { Link } from 'react-router-dom';
const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  // Update to handle both login and registration in one modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

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
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-[#22c55e] font-bold text-2xl">Smart Travel</span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a href="#" className="text-[#22c55e] border-b-2 border-[#22c55e] px-3 pt-5 pb-2 font-medium text-sm">
                  Home
                </a>
                <a href="#" className="text-[#6b7280] hover:text-[#22c55e] px-3 pt-5 pb-2 font-medium text-sm">
                  Destinations
                </a>
                <a href="#" className="text-[#6b7280] hover:text-[#22c55e] px-3 pt-5 pb-2 font-medium text-sm">
                  Experiences
                </a>
                <a href="#" className="text-[#6b7280] hover:text-[#22c55e] px-3 pt-5 pb-2 font-medium text-sm">
                  Rewards
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    className="w-64 pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6b7280]" />
                </div>
                
                {/* Updated to have Sign In and Sign Up buttons */}
                <button 
                  onClick={() => openAuthModal('login')}
                  className="text-[#22c55e] px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => openAuthModal('signup')}
                  className="bg-[#22c55e] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#16a34a] transition-colors"
                >
                  Sign Up
                </button>
              </div>
              <div className="md:hidden flex items-center ml-4">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-[#6b7280] hover:text-[#22c55e]"
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
              <a href="#" className="bg-[#22c55e]/10 text-[#22c55e] block pl-3 pr-4 py-2 font-medium">
                Home
              </a>
              <a href="#" className="text-[#6b7280] hover:bg-gray-50 block pl-3 pr-4 py-2 font-medium">
                Destinations
              </a>
              <a href="#" className="text-[#6b7280] hover:bg-gray-50 block pl-3 pr-4 py-2 font-medium">
                Experiences
              </a>
              <a href="#" className="text-[#6b7280] hover:bg-gray-50 block pl-3 pr-4 py-2 font-medium">
                Rewards
              </a>
              <div className="px-3 py-2">
                <input
                  type="text"
                  placeholder="Search destinations..."
                  className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none"
                />
                <Search className="absolute left-6 top-[14.5rem] h-4 w-4 text-[#6b7280]" />
              </div>
              <div className="px-3 py-2 space-y-2">
                <button 
                  onClick={() => openAuthModal('login')}
                  className="w-full bg-white border border-[#22c55e] text-[#22c55e] px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => openAuthModal('signup')}
                  className="w-full bg-[#22c55e] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#16a34a] transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gray-100">
        <div className="h-96 md:h-[32rem] w-full overflow-hidden">
          <img 
            src="/tourism3.jpg" 
            alt="Beautiful travel destination" 
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-80"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Welcome to Smart Travel
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
              Discover iconic landmarks, hidden gems, and must-visit attractions with expertly curated local recommendations.
            </p>
            <div className="max-w-xl mx-auto bg-white p-4 rounded-2xl shadow-md">
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Where would you like to go?" 
                  className="flex-grow px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                />
                <button className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-6 py-3 rounded-full font-medium transition-colors">
                  Explore Now
                </button>
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
            <h2 className="text-3xl font-bold text-[#22c55e] mb-4">Smart Travel with Local Insights</h2>
            <p className="text-[#6b7280] max-w-3xl mx-auto">
              Navigate effortlessly with highly intuitive smart maps, real-time personalized suggestions, and AI-powered travel insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/tourism1.jpg" 
                  alt="Map features" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-[#22c55e] mr-2" />
                  <h3 className="text-lg font-semibold text-[#22c55e]">Interactive Maps</h3>
                </div>
                <p className="text-[#6b7280]">
                  Explore with detailed maps featuring hidden gems and local favorites not found on typical tourist routes.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/tourism2.jpg" 
                  alt="Personalized recommendations" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-[#22c55e] mr-2" />
                  <h3 className="text-lg font-semibold text-[#22c55e]">Curated Experiences</h3>
                </div>
                <p className="text-[#6b7280]">
                  Discover experiences tailored to your interests, from food tours to adventure activities.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/tourism4.jpg" 
                  alt="Local guide insights" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-[#22c55e] mr-2" />
                  <h3 className="text-lg font-semibold text-[#22c55e]">Local Expert Guides</h3>
                </div>
                <p className="text-[#6b7280]">
                  Connect with knowledgeable locals who provide authentic insights into their cities and cultures.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Rest of the page content remains the same */}
        {/* Section 2: Rewards */}
        <div className="bg-[#22c55e]/10 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h2 className="text-3xl font-bold text-[#22c55e] mb-4">Unlock Rewards & Special Perks</h2>
              <p className="text-[#6b7280] mb-6">
                Gain access to exclusive discounts, special offers, VIP perks, and limited-time deals at top cafés, restaurants, and local events.
              </p>
              <button className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-6 py-3 rounded-full font-medium transition-colors">
                Start Exploring
              </button>
            </div>
            <div className="md:w-1/2">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src="/tourism1.jpg" 
                  alt="People enjoying travel rewards" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#22c55e] mb-4">What Our Travelers Say</h2>
            <p className="text-[#6b7280] max-w-3xl mx-auto">
              Read about the experiences of travelers who have explored with our Smart Travel guides.
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
                  "The local insights feature was incredible! I discovered amazing places I would have never found on my own. This app made my trip truly unforgettable."
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Newsletter Section */}
      <div className="bg-[#22c55e] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-white mb-2">Stay Updated</h2>
              <p className="text-white/80">
                Subscribe to our newsletter for travel tips and exclusive offers.
              </p>
            </div>
            <div className="md:w-1/2 flex">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-l-full focus:outline-none"
              />
              <button className="bg-white text-[#22c55e] px-6 py-3 rounded-r-full font-medium hover:bg-gray-100 transition-colors">
                Subscribe
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
              <h3 className="text-xl font-bold text-[#22c55e] mb-4">Smart Travel</h3>
              <p className="mb-4 text-[#6b7280]">Your ultimate travel companion with local insights and personalized recommendations.</p>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
                <div className="h-8 w-8 rounded-full bg-[#1877F2]"></div>
                <div className="h-8 w-8 rounded-full bg-[#1DA1F2]"></div>
                <div className="h-8 w-8 rounded-full bg-[#E1306C]"></div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Explore</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-[#6b7280] hover:text-white">Destinations</a></li>
                <li><a href="#" className="text-[#6b7280] hover:text-white">Experiences</a></li>
                <li><a href="#" className="text-[#6b7280] hover:text-white">Travel Guides</a></li>
                <li><a href="#" className="text-[#6b7280] hover:text-white">Local Insights</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-[#6b7280] hover:text-white">About Us</a></li>
                <li><a href="#" className="text-[#6b7280] hover:text-white">Careers</a></li>
                <li><a href="#" className="text-[#6b7280] hover:text-white">Blog</a></li>
                <li><a href="#" className="text-[#6b7280] hover:text-white">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-[#6b7280] hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-[#6b7280] hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-[#6b7280] hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-[#6b7280] hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;