import React, { useState } from 'react';
import { MapPin, ChevronLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import BusinessTypeStep from './BusinessTypeStep';

const AuthPage = ({ initialView = 'login', onClose }) => {
  const [showRegistration, setShowRegistration] = useState(initialView === 'signup');
  const [showLogin, setShowLogin] = useState(initialView === 'login');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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
    <div className="bg-white rounded-2xl shadow-md relative overflow-hidden min-h-[80vh] sm:min-h-screen md:min-h-[600px] md:h-[calc(100vh-100px)] max-h-screen flex flex-col">
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
      
      <div className="w-full flex-grow overflow-auto">
        {showLogin && (
          <LoginPage 
            onSignUpClick={handleSignUpClick}
            onClose={onClose}
            registrationSuccess={registrationSuccess}
          />
        )}
        
        {showRegistration && (
          <RegistrationFlow 
            onLoginClick={handleLoginClick}
            onClose={onClose}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        )}
      </div>
    </div>
  );
};

// Login Page Component
const LoginPage = ({ onClose, onSignUpClick, registrationSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accountNotFound, setAccountNotFound] = useState(false);

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
      console.log("Submitting login data:", formData);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      const data = await response.json();
      console.log("Login response:", data); // Add this to debug the response
      
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
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="text-center mb-4">
          <div className="flex justify-center items-center mb-2">
            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-[#22c55e] mr-1" />
            <span className="text-[#22c55e] font-bold text-lg sm:text-xl">Smart Travel</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1f2937]">Log In</h2>
        </div>
        
        {/* Success message after registration */}
        {registrationSuccess && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-md mb-4 text-xs sm:text-sm">
            Account created successfully! Please log in with your credentials.
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md mb-4 text-xs sm:text-sm">
            {error}
          </div>
        )}
        
        {/* Account not found message */}
        {accountNotFound && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-md mb-4 text-xs sm:text-sm">
            No account found with this email address. Please create an account first.
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 sm:px-4 py-2 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e] text-sm"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 sm:px-4 py-2 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e] text-sm"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                className="h-3 w-3 sm:h-4 sm:w-4 text-[#22c55e] rounded focus:ring-[#22c55e]"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 text-[#6b7280]">
                Remember me
              </label>
            </div>
            
            <a href="#" className="text-[#22c55e] hover:underline">
              Forgot Password?
            </a>
          </div>
          
          <button
            type="submit"
            className={`w-full bg-[#22c55e] text-white py-2 rounded-full font-semibold hover:bg-[#16a34a] transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
          
          {accountNotFound && (
            <button
              type="button"
              onClick={onSignUpClick}
              className="w-full bg-[#6b7280] text-white py-2 rounded-full font-semibold hover:bg-[#4b5563] transition-colors"
              disabled={isLoading}
            >
              Create an Account
            </button>
          )}
          
          <div className="text-center text-xs sm:text-sm text-[#6b7280] my-3 flex items-center justify-center">
            <div className="flex-grow border-t border-[#d1d5db] mr-4"></div>
            <span>Or continue with</span>
            <div className="flex-grow border-t border-[#d1d5db] ml-4"></div>
          </div>
          
          <div className="space-y-2">
            <button
              type="button"
              className="w-full flex justify-center items-center py-2 border border-[#d1d5db] rounded-full text-[#6b7280] hover:bg-gray-50 text-xs sm:text-sm"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="mr-2">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.11c-.22-.69-.35-1.43-.35-2.11s.13-1.42.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l2.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.86-2.59 3.29-4.51 6.16-4.51z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              className="w-full flex justify-center items-center py-2 border border-[#d1d5db] rounded-full text-[#6b7280] hover:bg-gray-50 text-xs sm:text-sm"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="mr-2">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2"/>
              </svg>
              Continue with Facebook
            </button>
          </div>
          
          <div className="text-center text-xs sm:text-sm text-[#6b7280] mt-3">
            Don't have an account? 
            <button 
              type="button"
              onClick={onSignUpClick}
              className="ml-2 text-[#22c55e] hover:underline"
              disabled={isLoading}
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Step 6: Interests Selection with Survey Link for non-partners
const InterestsStep = ({ data, updateData, onPrev, onRegistrationSuccess }) => {
  const [selectedInterests, setSelectedInterests] = useState(data.interests || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const navigate = useNavigate();

  const interestOptions = [
    'Local Cuisine', 'Street Food Tours', 'Coffee & Cafes', 'Museums & Galleries',
    'Local Festivals', 'Historical Landmarks', 'Architecture Tours', 'Hiking & Trails',
    'Beaches & Lakes', 'Parks & Gardens', 'Wildlife Watching', 'Live Music & Concerts',
    'Local Markets & Fairs', 'Theatres & Shows', 'Sports Events', 'Spas & Retreats'
  ];

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const updatedData = {
      ...data,
      interests: selectedInterests
    };
    
    // Update local state
    updateData(updatedData);
    
    try {
      console.log("Submitting registration data:", updatedData);
      
      // Send data to backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const responseData = await response.json();
      
      if (response.ok) {
        console.log("Registration successful:", responseData);
        setRegistrationCompleted(true);
        
        // Store token if provided in the response
        if (responseData.token) {
          localStorage.setItem('token', responseData.token);
        }
        
        // Show survey option for resident/tourist
        setShowSurvey(true);
      } else {
        console.error("Registration failed:", responseData);
        if (responseData.missingFields && responseData.missingFields.length > 0) {
          setError(`Missing required fields: ${responseData.missingFields.join(', ')}`);
        } else {
          setError(responseData.message || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurveyComplete = () => {
    // After survey complete, redirect to explorer
    navigate('/explorer');
  };

  const handleSkipSurvey = () => {
    // Skip survey and go directly to explorer
    navigate('/explorer');
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <button 
          onClick={onPrev} 
          className="mr-3 text-[#6b7280] hover:text-[#22c55e]"
          disabled={isLoading || registrationCompleted}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-[#1f2937]">
          {registrationCompleted ? "Registration Complete" : "Select Your Interests"}
        </h2>
      </div>
      
      {!registrationCompleted ? (
        <>
          <p className="text-[#6b7280] mb-4 text-sm">
            What excites you? Pick your interests and start exploring!
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="h-56 overflow-y-auto pr-2 mb-4">
              <div className="grid grid-cols-2 gap-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`py-2 border rounded-full text-xs font-medium transition-colors ${
                      selectedInterests.includes(interest)
                        ? 'bg-[#22c55e] text-white border-[#22c55e]'
                        : 'text-[#6b7280] border-[#d1d5db] hover:bg-[#22c55e]/10'
                    }`}
                    disabled={isLoading}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              type="submit"
              className={`w-full bg-[#22c55e] text-white py-2 rounded-full font-semibold hover:bg-[#16a34a] transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Completing Registration...' : 'Complete Registration'}
            </button>
          </form>
        </>
      ) : showSurvey ? (
        <div className="text-center py-10">
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-4 rounded-md mb-6 text-sm">
            <p className="font-semibold mb-2">Account created successfully!</p>
            <p>Take a quick survey to help us personalize your experience</p>
          </div>
          
          <div className="space-y-4">
            <a
              href={data.userType === 'resident' ? 'https://form.jotform.com/resident' : 'https://form.jotform.com/guest'}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#22c55e] text-white py-2 rounded-full font-semibold hover:bg-[#16a34a] transition-colors text-center"
              onClick={handleSurveyComplete}
            >
              Take Quick Survey
            </a>
            
            <button
              type="button"
              onClick={handleSkipSurvey}
              className="block w-full bg-[#6b7280] text-white py-2 rounded-full font-semibold hover:bg-[#4b5563] transition-colors"
            >
              Skip for Now
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-4 rounded-md mb-6 text-sm">
            <p className="font-semibold mb-2">Account created successfully!</p>
            <p>Redirecting you to the login page...</p>
          </div>
          <div className="flex justify-center">
            <svg className="animate-spin h-8 w-8 text-[#22c55e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};


// Main Registration Flow Component
const RegistrationFlow = ({ onLoginClick, onClose, onRegistrationSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
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
          />
        );
      case 2:
        return (
          <PhoneNumberStep 
            data={registrationData} 
            updateData={updateRegistrationData} 
            onNext={nextStep} 
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <EmailPasswordStep 
            data={registrationData} 
            updateData={updateRegistrationData} 
            onNext={nextStep} 
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <OTPVerificationStep 
            data={registrationData} 
            updateData={updateRegistrationData} 
            onNext={nextStep} 
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <UserTypeStep 
            data={registrationData} 
            updateData={updateRegistrationData} 
            onNext={nextStep} 
            onPrev={prevStep}
          />
        );
      case 6:
        // Check display user type to maintain UI consistency
        if (registrationData.displayUserType === 'partner') {
          return (
            <BusinessTypeStep 
              data={registrationData} 
              updateData={updateRegistrationData} 
              onPrev={prevStep}
              onRegistrationSuccess={handleRegistrationSuccess}
            />
          );
        } else {
          return (
            <InterestsStep 
              data={registrationData} 
              updateData={updateRegistrationData} 
              onPrev={prevStep}
              onRegistrationSuccess={handleRegistrationSuccess}
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
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-[#22c55e] mr-2" />
            <span className="text-[#22c55e] font-bold text-xl">Smart Travel</span>
          </div>
          
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

// Step 1: Name Input
const NameStep = ({ data, updateData, onNext, onLoginClick }) => {
  const [firstName, setFirstName] = useState(data.firstName);
  const [lastName, setLastName] = useState(data.lastName);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (firstName && lastName) {
      updateData({ firstName, lastName });
      onNext();
    }
  };

  return (
    <div className="px-4 py-4 sm:py-6 md:p-8 h-full flex flex-col justify-between">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1f2937] mb-4 text-center">
          Registration For Customer
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e] text-sm"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e] text-sm"
            />
          </div>
          <div className="item-bottom">
          <button
            type="submit"
            className="w-full bg-[#22c55e] text-white py-2 rounded-full font-semibold hover:bg-[#16a34a] transition-colors"
          >
            Create Account
          </button>
          </div>
        </form>
      </div>
      
      <div className="text-center text-xs sm:text-sm text-[#6b7280] mt-4">
        Already have an account? 
        <button 
          type="button" 
          onClick={onLoginClick} 
          className="ml-2 text-[#22c55e] hover:underline"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

// Step 2: Phone Number Input
const PhoneNumberStep = ({ data, updateData, onNext, onPrev }) => {
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber) {
      updateData({ phoneNumber });
      onNext();
    }
  };

  return (
    <div className="px-4 py-4 sm:py-6">
      <div className="flex items-center mb-4">
        <button 
          onClick={onPrev} 
          className="mr-3 text-[#6b7280] hover:text-[#22c55e]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1f2937]">
          OTP Verification
        </h2>
      </div>
      <p className="text-[#6b7280] mb-4 text-xs sm:text-sm">
        We will send you an One Time Password on this mobile number
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          className="w-full px-3 sm:px-4 py-2 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e] text-sm"
        />
        <button
          type="submit"
          className="w-full bg-[#22c55e] text-white py-2 rounded-full font-semibold hover:bg-[#16a34a] transition-colors"
        >
          Generate OTP
        </button>
      </form>
    </div>
  );
};

// Step 3: Email and Password
const EmailPasswordStep = ({ data, updateData, onNext, onPrev }) => {
  const [email, setEmail] = useState(data.email);
  const [password, setPassword] = useState(data.password);
  const [confirmPassword, setConfirmPassword] = useState(data.confirmPassword);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (email && password) {
      updateData({ email, password, confirmPassword });
      onNext();
    }
  };

  return (
    <div className="px-4 py-4 sm:py-6">
      <div className="flex items-center mb-4">
        <button 
          onClick={onPrev} 
          className="mr-3 text-[#6b7280] hover:text-[#22c55e]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1f2937]">
          Email & Password
        </h2>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md mb-4 text-xs sm:text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 sm:px-4 py-2 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e] text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 sm:px-4 py-2 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e] text-sm"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-3 sm:px-4 py-2 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e] text-sm"
        />
        <button
          type="submit"
          className="w-full bg-[#22c55e] text-white py-2 rounded-full font-semibold hover:bg-[#16a34a] transition-colors"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

// Step 4: OTP Verification (continued)
const OTPVerificationStep = ({ data, updateData, onNext, onPrev }) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp) {
      updateData({ otp });
      onNext();
    }
  };

  return (
    <div className="px-4 py-4 sm:py-6">
      <div className="flex items-center mb-4">
        <button 
          onClick={onPrev} 
          className="mr-3 text-[#6b7280] hover:text-[#22c55e]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1f2937]">
          Verification
        </h2>
      </div>
      <p className="text-[#6b7280] mb-3 text-xs sm:text-sm">
        We need to register your phone number before getting started
      </p>
      <p className="text-[#6b7280] mb-3 text-xs sm:text-sm">
        Send to (+1) {data.phoneNumber || '8545678920'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center space-x-2 mb-4">
          {['2', '3', '0', '1'].map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="w-8 h-8 sm:w-10 sm:h-10 text-center border border-[#d1d5db] rounded-lg text-sm sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
              value={digit}
              readOnly
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'x', 0, '⌫'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => {
                if (num === 'x') return;
                if (num === '⌫') {
                  setOtp(prev => prev.slice(0, -1));
                } else {
                  setOtp(prev => prev + num);
                }
              }}
              className="bg-gray-100 py-2 rounded-lg hover:bg-gray-200 text-xs sm:text-sm"
            >
              {num}
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="w-full mt-4 bg-[#22c55e] text-white py-2 rounded-full font-semibold hover:bg-[#16a34a] transition-colors"
        >
          Verify Phone Number
        </button>
      </form>
    </div>
  );
};

// Step 5: User Type Selection
// Updated UserTypeStep component to match backend user type requirements
const UserTypeStep = ({ data, updateData, onNext, onPrev }) => {
  const [userType, setUserType] = useState(data.userType);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    if (!userType) {
      setError("Please select a user type");
      return;
    }
    
    // Store the UI-friendly version as 'displayUserType' - this preserves 'partner' for the UI
    // But use the backend-compatible version in 'userType'
    const backendUserType = userType === 'partner' ? 'business' : userType;
    
    updateData({ 
      userType: backendUserType, 
      displayUserType: userType // Save display version for UI consistency
    });
    
    onNext();
  };

  return (
    <div className="h-full">
      <div className="flex items-center mb-4">
        <button 
          onClick={onPrev} 
          className="mr-3 text-[#6b7280] hover:text-[#22c55e]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-[#1f2937]">
          Select User Type
        </h2>
      </div>
      <p className="text-[#6b7280] mb-4 text-sm">
        Let's Get Started. Pick Your User Type
      </p>
      
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setUserType('resident')}
            className={`py-4 border rounded-xl ${
              userType === 'resident' 
                ? 'border-[#22c55e] bg-[#22c55e]/10' 
                : 'border-[#d1d5db]'
            }`}
          >
            <div className="text-center">
              <img 
                src="/resident.png" 
                alt="Resident" 
                className="mx-auto mb-2"
              />
              <h3 className="font-semibold text-sm text-[#1f2937]">Resident</h3>
              <p className="text-[#6b7280] text-xs">Living a simple life</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setUserType('tourist')}
            className={`py-4 border rounded-xl ${
              userType === 'tourist' 
                ? 'border-[#22c55e] bg-[#22c55e]/10' 
                : 'border-[#d1d5db]'
            }`}
          >
            <div className="text-center">
              <img 
                src="/tourist.png" 
                alt="Tourist" 
                className="mx-auto mb-2"
              />
              <h3 className="font-semibold text-sm text-[#1f2937]">Tourist</h3>
              <p className="text-[#6b7280] text-xs">Exploring places</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setUserType('partner')}
            className={`py-4 border rounded-xl ${
              userType === 'partner' 
                ? 'border-[#22c55e] bg-[#22c55e]/10' 
                : 'border-[#d1d5db]'
            }`}
          >
            <div className="text-center">
              <img 
                src="/Business.png" 
                alt="Partner" 
                className="mx-auto mb-2"
              />
              <h3 className="font-semibold text-sm text-[#1f2937]">Partner</h3>
              <p className="text-[#6b7280] text-xs">Managing services</p>
            </div>
          </button>
        </div>
        <button
          type="submit"
          className="w-full mt-4 bg-[#22c55e] text-white py-2 rounded-full font-semibold hover:bg-[#16a34a] transition-colors"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

// Export all components
export {
  AuthPage,
  LoginPage,
  RegistrationFlow,
  NameStep,
  PhoneNumberStep,
  EmailPasswordStep,
  OTPVerificationStep,
  UserTypeStep,
  InterestsStep
};