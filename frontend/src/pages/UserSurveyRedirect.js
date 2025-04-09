import React, { useState, useEffect } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Component that displays after a resident or guest completes registration
 * Shows a survey link and then redirects to the explorer page
 */
const UserSurveyRedirect = ({ userType = 'guest' }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [skipped, setSkipped] = useState(false);

  // Determine which survey link to show based on user type
  const surveyLink = userType === 'resident' 
    ? 'https://tally.so/r/m6PqkO' 
    : 'https://tally.so/r/m6PqkO';

  useEffect(() => {
    // Start countdown for automatic redirect
    if (!skipped && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (!skipped && countdown === 0) {
      navigate('/explorer');
    }
  }, [countdown, skipped, navigate]);

  const handleSurveyClick = () => {
    // Open survey in new tab and prepare for redirect
    window.open(surveyLink, '_blank');
    setSkipped(true);
    
    // Redirect after a short delay
    setTimeout(() => {
      navigate('/explorer');
    }, 1500);
  };

  const handleSkip = () => {
    setSkipped(true);
    navigate('/explorer');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-4">
            <MapPin className="h-10 w-10 text-[#22c55e]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Smart Travel!</h1>
          <p className="text-gray-600 mt-2">Your {userType} account has been created successfully.</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Personalize your experience</h2>
          <p className="text-blue-700">
            Take a quick survey to help us provide you with personalized recommendations and a better experience.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleSurveyClick}
            className="w-full bg-[#22c55e] text-white py-3 px-4 rounded-full font-semibold hover:bg-[#16a34a] transition-colors flex items-center justify-center"
          >
            Take Quick Survey <ExternalLink className="ml-2 h-4 w-4" />
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-full font-medium hover:bg-gray-300 transition-colors"
          >
            Skip and Start Exploring
          </button>
          
          {!skipped && (
            <p className="text-center text-gray-500 text-sm">
              Automatically redirecting to map in {countdown} seconds
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSurveyRedirect;