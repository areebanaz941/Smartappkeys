import React, { useState, useEffect } from 'react';
import { MapPin, ChevronLeft, X, Mail, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import BusinessTypeStep from './BusinessTypeStep';

// Common Logo Header Component to reuse across all screens
const LogoHeader = ({ currentLanguage }) => {
  return (
    <div className="flex items-center justify-center mb-6">
      <Link to="/" className="flex items-center">
        <img 
          src={currentLanguage === 'it' ? "/italLogo-removebg-preview.png" : "/logo.png"} 
          alt="San Lorenzo Nuovo Logo" 
          className="h-16 w-auto mr-3" 
        />
        <span className="font-bold text-lg text-[#22c55e]">Smart AppKey</span>
      </Link>
    </div>
  );
};

export const AuthPage = ({ initialView = 'login', onClose }) => {
  const [showRegistration, setShowRegistration] = useState(initialView === 'signup');
  const [showLogin, setShowLogin] = useState(initialView === 'login');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Load the language from localStorage when component mounts
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const handleSignUpClick = () => {
    setShowLogin(false);
    setShowRegistration(true);
    setRegistrationSuccess(false);
  };

  const handleLoginClick = () => {
    setShowRegistration(false);
    setShowLogin(true);
  };

  const handleRegistrationSuccess = () => {
    setRegistrationSuccess(true);
    setShowRegistration(false);
    setShowLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg relative overflow-hidden w-full max-w-md">
        {/* Close button */}
        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        )}
        
        <div className="w-full overflow-auto">
          {showLogin && (
            <LoginPage 
              onSignUpClick={handleSignUpClick}
              onClose={onClose}
              registrationSuccess={registrationSuccess}
              currentLanguage={currentLanguage}
            />
          )}
          
          {showRegistration && (
            <RegistrationFlow 
              onLoginClick={handleLoginClick}
              onClose={onClose}
              onRegistrationSuccess={handleRegistrationSuccess}
              currentLanguage={currentLanguage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Login Page Component - Modified to support languages
const LoginPage = ({ onClose, onSignUpClick, registrationSuccess, currentLanguage }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Text translations based on language
  const texts = {
    welcomeBack: currentLanguage === 'it' ? 'Bentornato!' : 'Welcome Back!',
    signInPrompt: currentLanguage === 'it' ? 'Accedi al tuo account' : 'Please sign in to your account',
    accountCreated: currentLanguage === 'it' ? 'Account creato con successo! Accedi con le tue credenziali.' : 'Account created successfully! Please log in with your credentials.',
    noAccountFound: currentLanguage === 'it' ? 'Nessun account trovato con questo indirizzo email. Si prega di creare un account.' : 'No account found with this email address. Please create an account first.',
    emailLabel: currentLanguage === 'it' ? 'Indirizzo email' : 'Email address',
    passwordLabel: currentLanguage === 'it' ? 'Password' : 'Password',
    rememberMe: currentLanguage === 'it' ? 'Ricordami' : 'Remember me',
    forgotPassword: currentLanguage === 'it' ? 'Password dimenticata?' : 'Forgot Password?',
    logIn: currentLanguage === 'it' ? 'Accedi' : 'Log in',
    loggingIn: currentLanguage === 'it' ? 'Accesso in corso...' : 'Logging in...',
    createAccount: currentLanguage === 'it' ? 'Crea un account' : 'Create an Account',
    or: currentLanguage === 'it' ? 'O' : 'OR',
    explore: currentLanguage === 'it' ? 'Esplora' : 'Explore',
    noAccount: currentLanguage === 'it' ? 'Non hai un account?' : 'Don\'t have an account?',
    signUp: currentLanguage === 'it' ? 'Registrati' : 'Sign up'
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Navigate to appropriate dashboard based on user type
  const navigateToUserDashboard = (userType) => {
    console.log("Navigating to dashboard for user type:", userType);
    
    // Convert to lowercase and trim to handle case differences and whitespace
    const type = userType?.toLowerCase().trim();
    
    switch(type) {
      case 'resident':
        navigate('/explorer');
        break;
      case 'tourist':
      case 'guest':
        navigate('/explorer');
        break;
      case 'partner': // Changed from 'business' to 'partner'
        navigate('/business-dashboard');
        break;
      default:
        console.warn('Unknown user type:', userType, 'Redirecting to default dashboard');
        navigate('/dashboard');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAccountNotFound(false);
    
    try {
      console.log("Submitting login data for user:", formData.email);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      const data = await response.json();
      console.log("Login response:", data);
      if (response.ok) {
        console.log("Login successful:", data);
        
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        
        // Extract user type from response - handle different possible structures
        let userType;
        if (data.user && data.user.userType) {
          userType = data.user.userType;
        } else if (data.userType) {
          userType = data.userType;
        } else if (data.user && data.user.type) {
          userType = data.user.type;
        } else {
          // Default to a generic dashboard if type cannot be determined
          userType = 'default';
        }
        
        console.log("Navigating with user type:", userType);
        
        // Navigate to appropriate dashboard
        navigateToUserDashboard(userType);
        
        if (onClose) onClose();
      } else {
        console.error("Login failed:", data);
        
        // Check if the error is due to user not found
        if (data.code === 'auth/user-not-found' || 
            data.message?.toLowerCase().includes('not found') || 
            data.message?.toLowerCase().includes('no account')) {
          setAccountNotFound(true);
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-6 py-8">
      {/* Logo */}
      <LogoHeader currentLanguage={currentLanguage} />

      <h1 className="text-xl font-bold text-gray-800 mb-1">{texts.welcomeBack}</h1>
      <p className="text-sm text-gray-500 mb-6">{texts.signInPrompt}</p>
      
      {/* Success message after registration */}
      {registrationSuccess && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-md mb-4 text-xs w-full">
          {texts.accountCreated}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md mb-4 text-xs w-full">
          {error}
        </div>
      )}
      
      {/* Account not found message */}
      {accountNotFound && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-md mb-4 text-xs w-full">
          {texts.noAccountFound}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Mail size={18} className="text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            placeholder={texts.emailLabel}
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            placeholder={texts.passwordLabel}
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={18} className="text-gray-400" />
            ) : (
              <Eye size={18} className="text-gray-400" />
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="rememberMe"
              type="checkbox"
              className="h-4 w-4 text-green-500 rounded focus:ring-green-500"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="remember-me" className="ml-2 text-gray-500">
              {texts.rememberMe}
            </label>
          </div>
          
          <a href="#" className="text-green-500 hover:underline">
            {texts.forgotPassword}
          </a>
        </div>
        
        <button
          type="submit"
          className={`w-full bg-green-500 text-white py-3 rounded-full font-semibold hover:bg-green-600 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? texts.loggingIn : texts.logIn}
        </button>
        
        {accountNotFound && (
          <button
            type="button"
            onClick={onSignUpClick}
            className="w-full bg-gray-500 text-white py-3 rounded-full font-semibold hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            {texts.createAccount}
          </button>
        )}
      </form>
      
      <div className="w-full text-center text-xs text-gray-500 my-4 flex items-center justify-center">
        <div className="flex-grow border-t border-gray-200 mr-4"></div>
        <span>{texts.or}</span>
        <div className="flex-grow border-t border-gray-200 ml-4"></div>
      </div>
      
      <div className="flex justify-center space-x-4 w-full">
        <button
          type="button"
          className="p-3 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.11c-.22-.69-.35-1.43-.35-2.11s.13-1.42.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l2.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.86-2.59 3.29-4.51 6.16-4.51z" fill="#EA4335"/>
          </svg>
        </button>
        <button
          type="button"
          className="p-3 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83z"/>
            <path d="M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </button>
        <button
          type="button"
          className="p-3 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2"/>
          </svg>
        </button>
      </div>
      
      <button
        type="button"
        className="w-full bg-indigo-900 text-white py-3 rounded-full font-semibold mt-6"
        onClick={() => navigate('/explorer')}
      >
        {texts.explore}
      </button>
      
      <div className="text-center text-xs text-gray-500 mt-6">
        {texts.noAccount} 
        <button 
          type="button"
          onClick={onSignUpClick}
          className="ml-2 text-green-500 hover:underline"
          disabled={isLoading}
        >
          {texts.signUp}
        </button>
      </div>
    </div>
  );
};

// Main Registration Flow Component - Modified to support languages
const RegistrationFlow = ({ onLoginClick, onClose, onRegistrationSuccess, currentLanguage }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    displayUserType: '', // UI-friendly user type (shows "partner" while backend gets "business")
    businessType: '',
    interests: []
  });

  const updateRegistrationData = (newData) => {
    setRegistrationData(prev => ({
      ...prev,
      ...newData
    }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // Handle successful registration based on user type
  const handleRegistrationSuccess = (userType) => {
    // Store displayUserType to maintain UI consistency
    const displayType = registrationData.displayUserType || userType;
    
    if (displayType === 'partner') {
      // For partners, redirect to partner survey
      navigate('/partner-survey');
    } else {
      // For other users, show the standard registration success
      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      }
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <NameStep 
            data={registrationData} 
            updateData={updateRegistrationData} 
            onNext={nextStep} 
            onLoginClick={onLoginClick || (() => setIsLoginModalOpen(true))}
            currentLanguage={currentLanguage}
          />
        );
      case 2:
        return (
          <EmailPasswordStep 
            data={registrationData} 
            updateData={updateRegistrationData} 
            onNext={nextStep} 
            onPrev={prevStep}
            currentLanguage={currentLanguage}
          />
        );
      case 3:
        return (
          <UserTypeStep 
            data={registrationData} 
            updateData={updateRegistrationData} 
            onNext={nextStep} 
            onPrev={prevStep}
            currentLanguage={currentLanguage}
          />
        );
      case 4:
        // Check display user type to maintain UI consistency
        if (registrationData.displayUserType === 'partner') {
          return (
            <BusinessTypeStep 
              data={registrationData} 
              updateData={updateRegistrationData} 
              onPrev={prevStep}
              onRegistrationSuccess={handleRegistrationSuccess}
              currentLanguage={currentLanguage}
            />
          );
        } else {
          return (
            <InterestsStep 
              data={registrationData} 
              updateData={updateRegistrationData} 
              onPrev={prevStep}
              onRegistrationSuccess={handleRegistrationSuccess}
              currentLanguage={currentLanguage}
            />
          );
        }
      default:
        return null;
    }
  };

  return (
    <div className="bg-white relative">
      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button 
              onClick={() => setIsLoginModalOpen(false)} 
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
            <LoginPage 
              onClose={() => setIsLoginModalOpen(false)} 
              onSignUpClick={() => {
                setIsLoginModalOpen(false);
              }}
              currentLanguage={currentLanguage}
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4">
        <div className="max-w-lg mx-auto">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};