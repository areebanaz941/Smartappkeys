import React, { useState } from 'react';
import { MapPin, ChevronLeft, X, XCircle } from 'lucide-react';

export const AuthPage = ({ initialView = 'login', onClose }) => {
  const [showRegistration, setShowRegistration] = useState(initialView === 'signup');
  const [showLogin, setShowLogin] = useState(initialView === 'login');

  const handleSignUpClick = () => {
    setShowLogin(false);
    setShowRegistration(true);
  };

  const handleLoginClick = () => {
    setShowRegistration(false);
    setShowLogin(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md relative overflow-hidden">
      {/* Close button - Now inside the form at the top-right corner */}
      {onClose && (
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
      )}
      
      <div className="w-full">
        {showLogin && (
          <LoginPage 
            onSignUpClick={handleSignUpClick}
            onClose={onClose}
          />
        )}
        
        {showRegistration && (
          <RegistrationFlow 
            onLoginClick={handleLoginClick}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};
// Login Page Component
export const LoginPage = ({ onClose, onSignUpClick }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add login logic here
    console.log('Login submitted', formData);
    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-4">
            <MapPin className="h-10 w-10 text-[#22c55e] mr-2" />
            <span className="text-[#22c55e] font-bold text-2xl">Smart Travel</span>
          </div>
          <h2 className="text-3xl font-bold text-[#1f2937]">Log In</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-[#22c55e] rounded focus:ring-[#22c55e]"
                checked={formData.rememberMe}
                onChange={handleChange}
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
            className="w-full bg-[#22c55e] text-white py-3 rounded-full font-semibold hover:bg-[#16a34a] transition-colors"
          >
            Log In
          </button>
          
          <div className="text-center text-sm text-[#6b7280] my-4 flex items-center justify-center">
            <div className="flex-grow border-t border-[#d1d5db] mr-4"></div>
            <span>Or continue with</span>
            <div className="flex-grow border-t border-[#d1d5db] ml-4"></div>
          </div>
          
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex justify-center items-center py-3 border border-[#d1d5db] rounded-full text-[#6b7280] hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="mr-2">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.11c-.22-.69-.35-1.43-.35-2.11s.13-1.42.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l2.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.86-2.59 3.29-4.51 6.16-4.51z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              className="w-full flex justify-center items-center py-3 border border-[#d1d5db] rounded-full text-[#6b7280] hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="mr-2">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2"/>
              </svg>
              Continue with Facebook
            </button>
          </div>
          
          <div className="text-center text-sm text-[#6b7280] mt-4">
            Don't have an account? 
            <button 
              type="button"
              onClick={onSignUpClick}
              className="ml-2 text-[#22c55e] hover:underline"
            >
              Sign Up
            </button>
          </div>
        </form>
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
    <div>
      <h2 className="text-3xl font-bold text-[#1f2937] mb-6 text-center">
        Registration For Customer
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#22c55e] text-white py-3 rounded-full font-semibold hover:bg-[#16a34a] transition-colors"
        >
          Create Account
        </button>
        
        <div className="text-center text-sm text-[#6b7280] mt-4">
          Already have an account? 
          <button 
            type="button" 
            onClick={onLoginClick} 
            className="ml-2 text-[#22c55e] hover:underline"
          >
            Sign In
          </button>
        </div>
      </form>
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
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={onPrev} 
          className="mr-4 text-[#6b7280] hover:text-[#22c55e]"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-3xl font-bold text-[#1f2937]">
          OTP Verification
        </h2>
      </div>
      <p className="text-[#6b7280] mb-6">
        We will send you an One Time Password on this mobile number
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          className="w-full px-4 py-3 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
        />
        <button
          type="submit"
          className="w-full bg-[#22c55e] text-white py-3 rounded-full font-semibold hover:bg-[#16a34a] transition-colors"
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (email && password) {
      updateData({ email, password, confirmPassword });
      onNext();
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={onPrev} 
          className="mr-4 text-[#6b7280] hover:text-[#22c55e]"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-3xl font-bold text-[#1f2937]">
          Email & Password
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border border-[#d1d5db] rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
        />
        <button
          type="submit"
          className="w-full bg-[#22c55e] text-white py-3 rounded-full font-semibold hover:bg-[#16a34a] transition-colors"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

// Step 4: OTP Verification
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
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={onPrev} 
          className="mr-4 text-[#6b7280] hover:text-[#22c55e]"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-3xl font-bold text-[#1f2937]">
          Verification
        </h2>
      </div>
      <p className="text-[#6b7280] mb-6">
        We need to register your phone number before getting started
      </p>
      <p className="text-[#6b7280] mb-6">
        Send to (+1) 8545678920
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-2 mb-6">
          {['2', '3', '0', '1'].map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="w-12 h-12 text-center border border-[#d1d5db] rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
              value={digit}
              readOnly
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
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
              className="bg-gray-100 py-3 rounded-lg hover:bg-gray-200"
            >
              {num}
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="w-full mt-6 bg-[#22c55e] text-white py-3 rounded-full font-semibold hover:bg-[#16a34a] transition-colors"
        >
          Verify Phone Number
        </button>
      </form>
    </div>
  );
};

// Step 5: User Type Selection
const UserTypeStep = ({ data, updateData, onNext, onPrev }) => {
  const [userType, setUserType] = useState(data.userType);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userType) {
      updateData({ userType });
      onNext();
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={onPrev} 
          className="mr-4 text-[#6b7280] hover:text-[#22c55e]"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-3xl font-bold text-[#1f2937]">
          Select User Type
        </h2>
      </div>
      <p className="text-[#6b7280] mb-6">
        Let's Get Started. Pick Your User Type
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setUserType('resident')}
            className={`py-6 border rounded-2xl ${
              userType === 'resident' 
                ? 'border-[#22c55e] bg-[#22c55e]/10' 
                : 'border-[#d1d5db]'
            }`}
          >
            <div className="text-center">
              <img 
                src="/api/placeholder/100/100" 
                alt="Resident" 
                className="mx-auto mb-4"
              />
              <h3 className="font-semibold text-[#1f2937]">Resident</h3>
              <p className="text-[#6b7280] text-sm">Living a simple life</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setUserType('guest')}
            className={`py-6 border rounded-2xl ${
              userType === 'guest' 
                ? 'border-[#22c55e] bg-[#22c55e]/10' 
                : 'border-[#d1d5db]'
            }`}
          >
            <div className="text-center">
              <img 
                src="/api/placeholder/100/100" 
                alt="Guest" 
                className="mx-auto mb-4"
              />
              <h3 className="font-semibold text-[#1f2937]">Guest</h3>
              <p className="text-[#6b7280] text-sm">Exploring and traveling</p>
            </div>
          </button>
        </div>
        <button
          type="submit"
          className="w-full mt-6 bg-[#22c55e] text-white py-3 rounded-full font-semibold hover:bg-[#16a34a] transition-colors"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

// Step 6: Interests Selection
const InterestsStep = ({ data, updateData, onNext, onPrev }) => {
  const [selectedInterests, setSelectedInterests] = useState(data.interests || []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedInterests.length > 0) {
      updateData({ interests: selectedInterests });
      // Here you would typically send the data to your backend
      handleRegistrationSubmit(data);
    } else {
      alert('Please select at least one interest');
    }
  };

  // Function to handle final registration submission
  const handleRegistrationSubmit = async (userData) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // Handle successful registration
        alert('Registration Successful!');
        // Redirect or show success message
      } else {
        // Handle registration error
        const errorData = await response.json();
        alert(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration');
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={onPrev} 
          className="mr-4 text-[#6b7280] hover:text-[#22c55e]"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-3xl font-bold text-[#1f2937]">
          Select Your Interests
        </h2>
      </div>
      <p className="text-[#6b7280] mb-6">
        What excites you? Pick your interests and start exploring!
      </p>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {interestOptions.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`py-3 border rounded-full text-sm font-medium transition-colors ${
                selectedInterests.includes(interest)
                  ? 'bg-[#22c55e] text-white border-[#22c55e]'
                  : 'text-[#6b7280] border-[#d1d5db] hover:bg-[#22c55e]/10'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="w-full bg-[#22c55e] text-white py-3 rounded-full font-semibold hover:bg-[#16a34a] transition-colors"
        >
          Continue
        </button>
      </form>
    </div>
  );
};


// Main Registration Flow Component
export const RegistrationFlow = ({ onLoginClick }) => {
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
        return (
          <InterestsStep 
            data={registrationData} 
            updateData={updateRegistrationData} 
            onNext={nextStep} 
            onPrev={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button 
              onClick={() => setIsLoginModalOpen(false)} 
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="h-8 w-8" />
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-8">
            <MapPin className="h-10 w-10 text-[#22c55e] mr-2" />
            <span className="text-[#22c55e] font-bold text-2xl">Smart Travel</span>
          </div>
          
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

// These are placeholder components that were referenced in paste-2.txt
// They're included to avoid circular dependencies but now with proper implementation
export const RegistrationPage = () => <RegistrationFlow />;
export const OTPVerificationPage = () => <OTPVerificationStep data={{}} updateData={() => {}} onNext={() => {}} onPrev={() => {}} />;
export const WelcomeScreen = () => (
  <div>
    <h1>Welcome to Smart Travel</h1>
    <p>Your journey begins here!</p>
  </div>
);

// Export all components
export {
  NameStep,
  PhoneNumberStep,
  EmailPasswordStep,
  OTPVerificationStep,
  UserTypeStep,
  InterestsStep
};