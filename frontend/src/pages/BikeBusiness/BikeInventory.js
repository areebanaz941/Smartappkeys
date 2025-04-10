import React, { useState } from 'react';
import { ChevronLeft, Calendar } from 'lucide-react';

const BikeDetails = ({ bike, onBack, onBook }) => {
  const [bookingData, setBookingData] = useState({
    date: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onBook({ bikeId: bike.id, ...bookingData });
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center border-b">
        <button 
          onClick={onBack}
          className="p-1 mr-3 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-medium">Book Bike</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          {/* Bike Info Card */}
          <div className="bg-green-50 p-4 rounded-lg flex items-center mb-6">
            <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center mr-4">
              {bike.images && bike.images.length > 0 ? (
                <img 
                  src={bike.images[0]} 
                  alt={bike.name} 
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div className="h-12 w-12 flex items-center justify-center text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-8 w-8">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
                    <circle cx="12" cy="10" r="3"/>
                    <path d="M5.34 17.66A8 8 0 0 1 12 2v0a8 8 0 0 1 6.66 15.66"/>
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h2 className="font-medium">{bike.id || 'BM001'}</h2>
              <p className="text-sm text-gray-600">{bike.model || 'E-mountain bike suitable for dirt roads'}</p>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit}>
            {/* Date & Time Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Date & Time</label>
              <div className="relative">
                <input 
                  type="datetime-local" 
                  name="date"
                  value={bookingData.date}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg pr-10"
                  placeholder="-- Select --"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea 
                name="notes"
                value={bookingData.notes}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-32"
                placeholder="Type here..."
              />
            </div>

            {/* Price Info (Optional) */}
            {bike.price && (
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Price:</span>
                  <span className="font-medium">{bike.price}</span>
                </div>
              </div>
            )}

            {/* Book Now Button */}
            <button 
              type="submit"
              className="w-full bg-green-500 text-white font-medium py-3 rounded-lg hover:bg-green-600 transition"
            >
              Book Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BikeDetails;