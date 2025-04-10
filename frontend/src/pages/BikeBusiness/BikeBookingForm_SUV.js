import React, { useState } from 'react';
import { ChevronLeft, Calendar, Bike } from 'lucide-react';

const BikeBookingSUV = () => {
  // Demo data
  const [currentBike] = useState({
    id: "BM001",
    name: "Mountain Explorer",
    model: "E-mountain bike suitable for dirt roads",
    price: "€75/day",
    images: ["/api/placeholder/400/320"]
  });
  
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
    alert(`Booking confirmed for ${currentBike.id} on ${bookingData.date}`);
  };

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto border rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center border-b">
        <button 
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
              <img 
                src={currentBike.images[0]} 
                alt={currentBike.name} 
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="font-medium">{currentBike.id}</h2>
              <p className="text-sm text-gray-600">{currentBike.model}</p>
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
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg h-32"
                placeholder="Type here..."
              />
            </div>

            {/* Price Info */}
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm">Price:</span>
                <span className="font-medium">{currentBike.price}</span>
              </div>
            </div>

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

export default BikeBookingSUV;