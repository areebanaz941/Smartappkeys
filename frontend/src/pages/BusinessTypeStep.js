import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessTypeStep = ({ data, updateData, onPrev, onRegistrationSuccess }) => {
  const [businessType, setBusinessType] = useState(data.businessType || '');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const navigate = useNavigate();

  const businessTypes = [
    'Restaurant',
    'Café & Bakery',
    'Retail Store',
    'Grocery & Supermarket',
    'Salons & Beauty',
    'Fitness & Gym',
    'Hotel & Lodging',
    'Event Planning & Services',
    'Tech & IT Services',
    'Automobile Services',
    'Health & Wellness',
    'Education & Coaching',
    'Art & Craft Studio',
    'E-commerce & Online Store'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!businessType) {
      setError("Please select a business type");
      return;
    }
    
    // Validate password length from data
    if (data.password && data.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    // Note: the backend expects 'business' instead of 'partner'
    // Update the userType to match backend requirements
    const updatedData = {
      ...data,
      userType: 'business', // Change 'partner' to 'business' to match backend enum
      businessType: businessType,
      // Add required fields based on backend validation
      interests: data.interests && data.interests.length > 0 
        ? data.interests 
        : ['Business Development'], // Default interest for businesses
      phoneNumber: "+1" + Math.floor(1000000000 + Math.random() * 9000000000) // Generate random phone number
    };
    
    // Update local state
    updateData(updatedData);
    
    try {
      console.log("Submitting partner registration data:", updatedData);
      
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
        console.log("Partner registration successful:", responseData);
        setRegistrationCompleted(true);
        
        // Store token if provided in the response
        if (responseData.token) {
          localStorage.setItem('token', responseData.token);
        }
        
        // Wait 2 seconds before redirecting to partner survey
        setTimeout(() => {
          navigate('/partner-survey');
        }, 2000);
      } else {
        console.error("Registration failed:", responseData);
        if (responseData.error && responseData.error.includes("password")) {
          setError("Password must be at least 6 characters long. Please go back and update it.");
        } else if (responseData.missingFields && responseData.missingFields.length > 0) {
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

  return (
    <div className="px-4 py-6 bg-white">
      <div className="flex items-center mb-4">
        <button 
          onClick={onPrev} 
          className="mr-3 text-gray-500 hover:text-green-500"
          disabled={isLoading || registrationCompleted}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {registrationCompleted ? "Registration Complete" : "Select your Business Type"}
        </h2>
      </div>
      
      {!registrationCompleted ? (
        <>
          <p className="text-gray-500 mb-6">
            Choose the category that best describes your business and start growing!
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="h-64 overflow-y-auto pr-2 mb-2">
              <div className="grid grid-cols-2 gap-3">
                {businessTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBusinessType(type)}
                    className={`py-3 px-4 rounded-full text-center text-sm transition-colors ${
                      businessType === type
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                    disabled={isLoading}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              type="submit"
              className={`w-full bg-green-500 text-white py-3 rounded-full font-semibold hover:bg-green-600 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Completing Registration...' : 'Complete Registration'}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-10">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-md mb-6 text-sm">
            <p className="font-semibold mb-2">Account created successfully!</p>
            <p>Redirecting you to complete a quick partner survey...</p>
          </div>
          <div className="flex justify-center">
            <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessTypeStep;