import React, { useState } from 'react';
import { 
  Bike, Plus, FileEdit, Trash2, X, ChevronLeft, ChevronRight, ImagePlus 
} from 'lucide-react';
import BikeDetails from './BikeDetails';

const BikeManagement = () => {
  const [vehicles, setVehicles] = useState([
    {
      id: "XP_SUV_01",
      name: "Trekking SUV",
      model: "E-mountain bike suitable for dirt roads",
      type: "SUV",
      available: true,
      price: "€3,290",
      description: "The perfect e-bike for versatility and comfort in any situation.",
      specs: "XP Bikes SUV Model - Battery: 630Wh - Range: 80km",
      images: [
        "/suv-a.png",
        "/suv-b.png",
        "/suv-c.png"
      ],
      technicalSpecifications: {
        chassis: "27.5\" aluminum suspension",
        motor: "XP control panel 48V-250W XP (100Nm)",
        battery: "48V20Ah 960Wh",
        gearing: "Shimano Altus M370, 9-speed",
        brakes: "Hydraulic disc, 180mm",
        coverage: "CST 27.5\" x 2.4\"",
        display: "COLOR LCD Sport"
      }
    },
    {
      id: "XP_ID7_01",
      name: "Urban Glide",
      model: "E-urban bike suitable for paved roads",
      type: "I-D7",
      available: true,
      price: "€2,790",
      description: "Sleek urban e-bike designed for city commuting.",
      specs: "XP Bikes I-D7 Model - Battery: 500Wh - Range: 70km",
      images: [
        "/urban-a.png",
        "/urban-b.png",
        "/urban-c.png"
      ],
      technicalSpecifications: {
        chassis: "Lightweight aluminum frame",
        motor: "City-optimized 36V-250W",
        battery: "36V15Ah 540Wh",
        gearing: "Shimano 8-speed",
        brakes: "Disc brakes, 160mm",
        coverage: "City-friendly 26\" x 1.75\"",
        display: "Compact LCD interface"
      }
    }
  ]);

  const [showAddBikeModal, setShowAddBikeModal] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);
  const [bookingBike, setBookingBike] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [newBike, setNewBike] = useState({
    id: '',
    name: '',
    model: '',
    type: '',
    available: true,
    price: '',
    description: '',
    specs: '',
    images: [],
    technicalSpecifications: {
      chassis: '',
      motor: '',
      battery: '',
      gearing: '',
      brakes: '',
      coverage: '',
      display: ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBike(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecsChange = (e) => {
    const { name, value } = e.target;
    setNewBike(prev => ({
      ...prev,
      technicalSpecifications: {
        ...prev.technicalSpecifications,
        [name]: value
      }
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setNewBike(prev => ({
      ...prev,
      images: [...(prev.images || []), ...imageUrls]
    }));
  };

  const handleAddBike = (e) => {
    e.preventDefault();
    // Validate required fields
    if (!newBike.id || !newBike.name || !newBike.type) {
      alert('Please fill in required fields');
      return;
    }

    // Add new bike to vehicles
    setVehicles([...vehicles, newBike]);
    
    // Reset form and close modal
    setNewBike({
      id: '',
      name: '',
      model: '',
      type: '',
      available: true,
      price: '',
      description: '',
      specs: '',
      images: [],
      technicalSpecifications: {
        chassis: '',
        motor: '',
        battery: '',
        gearing: '',
        brakes: '',
        coverage: '',
        display: ''
      }
    });
    setShowAddBikeModal(false);
  };

  const handleBookBike = (bike) => {
    setBookingBike(bike);
  };

  const handleBookSubmit = (bookingData) => {
    // Add booking to bookings
    setBookings([...bookings, {
      id: `booking-${Date.now()}`,
      ...bookingData,
      timestamp: new Date().toISOString()
    }]);
    
    // Close booking screen
    setBookingBike(null);
    
    // Show success message
    alert(`Booking confirmed for ${bookingData.bikeId}`);
  };

  // Render BikeDetails component when a bike is selected for booking
  if (bookingBike) {
    return (
      <BikeDetails 
        bike={bookingBike}
        onBack={() => setBookingBike(null)}
        onBook={handleBookSubmit}
      />
    );
  }

  const BikeDetailModal = ({ bike, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
      setCurrentImageIndex((prev) => 
        (prev + 1) % bike.images.length
      );
    };

    const prevImage = () => {
      setCurrentImageIndex((prev) => 
        prev === 0 ? bike.images.length - 1 : prev - 1
      );
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row">
          {/* Image Carousel */}
          <div className="w-full md:w-1/2 relative h-64 md:h-auto">
            <img 
              src={bike.images[currentImageIndex]} 
              alt={`${bike.name} view ${currentImageIndex + 1}`} 
              className="w-full h-full object-cover md:rounded-l-xl"
            />
            {bike.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {bike.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 w-2 rounded-full ${
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bike Details */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{bike.name}</h2>
                <p className="text-sm text-gray-600">{bike.model}</p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-green-600">{bike.price}</span>
                <span 
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bike.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {bike.available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-sm text-gray-600">{bike.description}</p>
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2">Specifications</h3>
                <p className="text-sm text-gray-600">{bike.specs}</p>
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2">Technical Details</h3>
                <table className="w-full text-sm text-gray-600">
                  <tbody>
                    {Object.entries(bike.technicalSpecifications).map(([key, value]) => (
                      <tr key={key} className="border-b last:border-b-0">
                        <td className="py-2 font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </td>
                        <td className="py-2">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex flex-col space-y-3">
              {/* Book Now Button */}
              {bike.available && (
                <button 
                  className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700"
                  onClick={() => {
                    onClose();
                    handleBookBike(bike);
                  }}
                >
                  Book Now
                </button>
              )}
              
              <div className="flex justify-end space-x-2">
                <button 
                  className="bg-blue-50 text-blue-600 p-2 rounded-full hover:bg-blue-100"
                  title="Edit Bike"
                  onClick={() => {
                    // TODO: Implement edit functionality
                    console.log('Edit bike', bike);
                  }}
                >
                  <FileEdit className="h-4 w-4" />
                </button>
                <button 
                  className="bg-red-50 text-red-600 p-2 rounded-full hover:bg-red-100"
                  title="Remove Bike"
                  onClick={() => {
                    // Remove bike from vehicles
                    setVehicles(vehicles.filter(v => v.id !== bike.id));
                    setSelectedBike(null);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddBikeModal = ({ 
    newBike, 
    setNewBike, 
    handleInputChange, 
    handleSpecsChange, 
    handleAddBike, 
    handleImageUpload, 
    setShowAddBikeModal 
  }) => {
    const removeImage = (index) => {
      setNewBike(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Add New Bike</h2>
            <button 
              onClick={() => setShowAddBikeModal(false)}
              className="text-gray-500 hover:text-gray-800"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
  
          <form onSubmit={handleAddBike} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                  Bike ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={newBike.id}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Enter bike ID"
                  required
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Bike Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newBike.name}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Enter bike name"
                  required
                />
              </div>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Bike Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={newBike.type}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select Bike Type</option>
                  <option value="SUV">SUV</option>
                  <option value="I-D7">I-D7</option>
                  <option value="Urban">Urban</option>
                </select>
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={newBike.price}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Enter bike price"
                />
              </div>
            </div>
  
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={newBike.description}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Enter bike description"
                rows="3"
              />
            </div>
  
            <div>
              <label htmlFor="specs" className="block text-sm font-medium text-gray-700 mb-1">
                Specifications
              </label>
              <input
                type="text"
                id="specs"
                name="specs"
                value={newBike.specs}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Enter bike specifications"
              />
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(newBike.technicalSpecifications).map((key) => (
                <div key={key}>
                  <label 
                    htmlFor={key} 
                    className="block text-sm font-medium text-gray-700 mb-1 capitalize"
                  >
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    id={key}
                    name={key}
                    value={newBike.technicalSpecifications[key]}
                    onChange={handleSpecsChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1')}`}
                  />
                </div>
              ))}
            </div>
  
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Bike Images
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <label 
                  htmlFor="image-upload" 
                  className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition"
                >
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <ImagePlus className="h-8 w-8 text-gray-400" />
                </label>
  
                {/* Preview Uploaded Images */}
                <div className="flex flex-wrap gap-2">
                  {newBike.images.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={imageUrl} 
                        alt={`Bike image ${index + 1}`} 
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
  
            {/* Availability Toggle */}
            <div>
              <label htmlFor="available" className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <select
                id="available"
                name="available"
                value={newBike.available}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value={true}>Available</option>
                <option value={false}>Unavailable</option>
              </select>
            </div>
  
            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => setShowAddBikeModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Add Bike
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 relative">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          <Bike className="mr-2 h-5 w-5 text-green-600" />
          Bike Management
        </h1>
        <button
          onClick={() => setShowAddBikeModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Bike
        </button>
      </div>

      {/* Bikes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((bike) => (
          <div 
            key={bike.id}
            className="border rounded-xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
            onClick={() => setSelectedBike(bike)}
          >
            <div className="relative h-48 bg-gray-100">
              {bike.images && bike.images.length > 0 ? (
                <img 
                  src={bike.images[0]} 
                  alt={bike.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Bike className="h-16 w-16" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h2 className="text-white font-bold">{bike.name}</h2>
                <p className="text-white/80 text-sm">{bike.type}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-green-600">{bike.price}</span>
                <span 
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bike.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {bike.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{bike.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bike className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Bikes Available</h3>
          <p className="text-gray-500 mb-6">Add your first bike to start managing your inventory</p>
          <button
            onClick={() => setShowAddBikeModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Bike
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedBike && (
        <BikeDetailModal 
          bike={selectedBike} 
          onClose={() => setSelectedBike(null)} 
        />
      )}

      {showAddBikeModal && (
        <AddBikeModal 
          newBike={newBike}
          setNewBike={setNewBike}
          handleInputChange={handleInputChange}
          handleSpecsChange={handleSpecsChange}
          handleAddBike={handleAddBike}
          handleImageUpload={handleImageUpload}
          setShowAddBikeModal={setShowAddBikeModal}
        />
      )}
    </div>
  );
};

export default BikeManagement;