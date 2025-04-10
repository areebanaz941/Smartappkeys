import React, { useState } from 'react';
import { ChevronLeft, Calendar, Bike, User, Phone, Mail } from 'lucide-react';

const BikeBookingID = () => {
  // Demo data
  const [currentBike] = useState({
    id: "Trekking SUV",
    name: "Mountain Explorer",
    model: "E-mountain bike suitable for dirt roads",
    price: "€75/day",
    images: ["suv-a.png"]
  });
  
  const [bookingData, setBookingData] = useState({
    bikeId: currentBike.id,
    date: '',
    name: '',
    phone: '',
    email: '',
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
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto border rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center border-b">
      <button 
          className="p-1 mr-3 rounded-full hover:bg-gray-100"
          aria-label="Go back"
          onClick={() => window.location.href = '/business-dashboard'}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <img 
                src="/logo.png" 
                alt="San Lorenzo Nuovo Logo" 
                className="h-16 w-auto mr-3" 
              />
        <h1 className="text-lg font-medium">Book Bike</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {/* Bike Info Card */}
        <div className="bg-green-50 p-4 rounded-lg flex items-center mb-6">
          <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
            <Bike className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h2 className="font-medium">{currentBike.id}</h2>
            <p className="text-sm text-gray-600">{currentBike.model}</p>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <div className="relative">
              <input 
                type="text" 
                name="name"
                value={bookingData.name}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg pr-10"
                placeholder="Enter your name"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <div className="relative">
              <input 
                type="tel" 
                name="phone"
                value={bookingData.phone}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg pr-10"
                placeholder="Enter your phone number"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Phone className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                name="email"
                value={bookingData.email}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg pr-10"
                placeholder="Enter your email"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Date & Time Selector */}
          <div>
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
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea 
              name="notes"
              value={bookingData.notes}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-24"
              placeholder="Type here..."
            />
          </div>

          {/* Price Info */}
          {currentBike.price && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm">Price:</span>
                <span className="font-medium">{currentBike.price}</span>
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
  );
};

export default BikeBookingID;