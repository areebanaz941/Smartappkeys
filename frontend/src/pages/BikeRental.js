// src/pages/BikeRental.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Clock, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';


// Bike inventory data - this would eventually come from your database
const bikeInventory = [
  {
    id: "XP_SUV_01",
    model: "E-mountain bike suitable for dirt roads",
    type: "SUV",
    available: true,
    imageUrl: "/google.jpg", // You'll need to add these images to your public folder
    specs: "XP Bikes SUV Model - Battery: 630Wh - Range: 80km"
  },
  {
    id: "XP_SUV_02",
    model: "E-mountain bike suitable for dirt roads",
    type: "SUV",
    available: true,
    imageUrl: "/bike-suv.jpg",
    specs: "XP Bikes SUV Model - Battery: 630Wh - Range: 80km"
  },
  {
    id: "XP_ID7_01",
    model: "E-urban bike suitable for paved roads",
    type: "I-D7",
    available: true,
    imageUrl: "/bike-id7.jpg",
    specs: "XP Bikes I-D7 Model - Battery: 500Wh - Range: 70km"
  }
];

const BikeRental = () => {
  const navigate = useNavigate();
  const [selectedBike, setSelectedBike] = useState(null);
  const [bookingStep, setBookingStep] = useState('list'); // 'list' or 'details'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  
  const handleSelectBike = (bike) => {
    setSelectedBike(bike);
    setBookingStep('details');
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // You'll need to set up EmailJS with your service ID, template ID, and public key
      // This is just a placeholder for the email submission
      const templateParams = {
        bike_id: selectedBike.id,
        bike_model: selectedBike.type,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        rental_date: formData.date,
        rental_time: formData.time,
        notes: formData.notes
      };
      
      // Uncomment and configure with your EmailJS details
      // await emailjs.send(
      //   "YOUR_SERVICE_ID",
      //   "YOUR_TEMPLATE_ID",
      //   templateParams,
      //   "YOUR_PUBLIC_KEY"
      // );
      
      // Simulating success for now
      setMessage({
        type: 'success',
        text: 'Booking request sent successfully! We will contact you shortly to confirm your reservation.'
      });
      
      // Reset form after 3 seconds and go back to list
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          email: '',
          date: '',
          time: '',
          notes: ''
        });
        setSelectedBike(null);
        setBookingStep('list');
        setMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to send email:', error);
      setMessage({
        type: 'error',
        text: 'There was a problem sending your booking request. Please try again or contact us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const today = new Date().toISOString().split('T')[0]; // Get today's date for min date in date picker
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="text-gray-500 mr-4">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-medium">
            {bookingStep === 'list' ? 'Bike Rental' : 'Book Bike'}
          </h1>
          <div className="ml-auto">
            <img src="/logo.png" alt="San Lorenzo Nuovo Logo" className="h-8 w-auto" />
          </div>
        </div>
      </div>
      
      <div className="max-w-md mx-auto px-4 py-6">
        {message && (
          <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}
        
        {bookingStep === 'list' ? (
          <>
            {/* Bike List */}
            <div className="space-y-3">
              {bikeInventory.map((bike) => (
                <div 
                  key={bike.id}
                  className="bg-green-50 rounded-lg p-3 flex items-center shadow-sm"
                >
                  <div className="mr-3">
                    <div className="w-16 h-16 bg-white rounded-md flex items-center justify-center overflow-hidden">
                      <img 
                        src={bike.imageUrl} 
                        alt={`${bike.type} bike`} 
                        className="h-12 w-auto"
                        onError={(e) => {
                          e.target.src = "/bike-placeholder.png"; // Fallback if image not found
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{bike.id}</div>
                    <div className="text-xs text-gray-600">{bike.model}</div>
                  </div>
                  <button
                    onClick={() => handleSelectBike(bike)}
                    className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <span>→</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Booking Details Form */}
            <div className="mb-4">
              <div className="bg-green-50 rounded-lg p-3 flex items-center shadow-sm mb-6">
                <div className="mr-3">
                  <div className="w-16 h-16 bg-white rounded-md flex items-center justify-center overflow-hidden">
                    <img 
                      src={selectedBike?.imageUrl} 
                      alt={`${selectedBike?.type} bike`} 
                      className="h-12 w-auto"
                      onError={(e) => {
                        e.target.src = "/bike-placeholder.png"; // Fallback if image not found
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-medium text-sm">{selectedBike?.id}</div>
                  <div className="text-xs text-gray-600">{selectedBike?.model}</div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="mb-6">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
                
                {/* Date & Time */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Date & Time</h3>
                  
                  <div className="mb-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={today}
                        required
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                      >
                        <option value="">-- Select --</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                <div className="mb-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Type here..."
                  ></textarea>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-md font-medium hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70"
                >
                  {isSubmitting ? 'Processing...' : 'Book Now'}
                </button>
                
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => setBookingStep('list')}
                  className="w-full mt-2 bg-gray-100 text-gray-600 py-2 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors"
                >
                  Back to Bike Selection
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BikeRental;