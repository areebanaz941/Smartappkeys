import React, { useState } from 'react';
import { 
  Home, Bike, Calendar, Star, BarChart, Settings, HelpCircle, 
  LogOut, Menu, X, Bell, Plus, FileEdit, Trash2, XCircle, ChevronRight, ChevronLeft,
  ImagePlus
} from 'lucide-react';
import { Link, BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// BikeDetails Component
const BikeDetails = ({ bike, onBack, onBook }) => {
  const [bookingData, setBookingData] = useState({
    bikeId: bike.id,
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
    onBook(bookingData);
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
              ) : bike.imageUrl && bike.imageUrl.length > 0 ? (
                <img 
                  src={bike.imageUrl[0]} 
                  alt={bike.name} 
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div className="h-12 w-12 flex items-center justify-center text-gray-400">
                  <Bike className="h-8 w-8" />
                </div>
              )}
            </div>
            <div>
              <h2 className="font-medium">{bike.id}</h2>
              <p className="text-sm text-gray-600">{bike.model}</p>
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

// AddBikeModal Component
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
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Model Description
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={newBike.model}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="E.g., E-mountain bike suitable for dirt roads"
            />
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
                  placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
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



// Business Dashboard Component
// Business Dashboard Component 
const BusinessDashboard = () => { 
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVehicleTypeModal, setShowVehicleTypeModal] = useState(false);
  const [showAddBikeModal, setShowAddBikeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);
  const [isAddBikeModalOpen, setIsAddBikeModalOpen] = useState(false);
  const [bikes, setBikes] = useState([
    {
      id: "XP_SUV_01",
      model: "E-mountain bike suitable for dirt roads",
      type: "SUV",
      available: true,
      imageUrl: [
        "/suv-a.png",
        "/suv-b.jpg",
        "/suv-c.jpg",
        "/suv-d.jpg",
        "/suv-e.jpg",
        "/suv-f.jpg",
        "/suv-g.jpg",
        "/suv-h.jpg"
      ],
      specs: "XP Bikes SUV Model - Battery: 630Wh - Range: 80km",
      name: "SUV",
      price: "€3,290",
      details: "The Trekking SUV is the perfect e-bike for those looking for versatility and comfort in every situation...",
      TechnicalSpecifications: "Chassis 27.5\" aluminum suspension\nMotor XP control panel 48V-250W XP (100Nm)\nBattery 48V20Ah 960Wh\nGearing Shimano Altus M370, 9-speed\nBrakes Hydraulic disc, 180mm\nCoverage CST 27.5\" x 2.4\"\nDisplay COLOR LCD Sport"
    },
    {
      id: "XP_ID7_01",
      model: "E-urban bike suitable for paved roads",
      type: "I-D7",
      available: true,
      imageUrl: [
        "/id7-a.png",
        "/id7-b.jpg",
        "/id7-c.jpg",
        "/id7-d.jpg",
        "/id7-e.jpg",
        "/id7-f.jpg",
        "/id7-g.jpg",
        "/id7-h.jpg"
      ],
      specs: "The I-D7 is equipped with a 40Nm XP rear wheel motor and a 48V-13Ah-624Wh XP battery. The setup is completed by 180mm mechanical disc brakes and a Shimano Tourney 300D 7-speed gearbox.",
      name: "I-D7",
      price: "€1,649",
      details: "Accessible, versatile and designed for the city, this e-bike combines practicality and performance in a compact design with an integrated battery. The 26″ wheels guarantee excellent accessibility, making it ideal even for smaller sizes. Thanks to the 40Nm XP rear motor and the 48V – 13Ah, 624Wh XP battery, it ensures smooth pedaling and excellent autonomy, perfect for your daily commute.",
      TechnicalSpecifications: "Chassis 27.5\" aluminum suspension\nMotor XP control panel 48V-250W XP (100Nm)\nBattery 48V20Ah 960Wh\nGearing Shimano Altus M370, 9-speed\nBrakes Hydraulic disc, 180mm\nCoverage CST 27.5\" x 2.4\"\nDisplay COLOR LCD Sport"
    }

  ]);
  const [newBike, setNewBike] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    type: '',
    status: 'active',
    specifications: {
      chassis: '',
      motor: '',
      battery: '',
      gearing: ''
    },
    images: []
  });
  // Add these handler functions
  const handleAddBike = (newBike) => {
    const bikeWithId = {
      ...newBike,
      id: `XP_${newBike.type}_${bikes.length + 1}`,
      available: true,
      specs: `${newBike.name} - Battery: Specifications to be added`
    };
    setBikes([...bikes, bikeWithId]);
    setIsAddBikeModalOpen(false);
  };

  const handleDeleteBike = (bikeId) => {
    setBikes(bikes.filter(bike => bike.id !== bikeId));
  };

  const handleBikeInputChange = (e) => {
    const { name, value } = e.target;
    setNewBike(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedBikeInputChange = (e) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    setNewBike(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Limit to 4 images
    const newImages = files.slice(0, 4 - (newBike.images?.length || 0));
    setNewBike(prev => ({
      ...prev,
      images: [...(prev.images || []), ...newImages]
    }));
  };

  const removeImage = (index) => {
    setNewBike(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Mock data (you would typically fetch this from an API)
  const businessProfile = {
    logo: '/api/placeholder/40/40',
    name: 'EcoBike Rentals',
    type: 'Vehicle Rental',
    address: '123 Green Street, Eco City',
    phone: '+1 (555) 123-4567',
    description: 'Sustainable urban mobility solutions with electric and traditional bikes.',
    hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed'
    }
  };

  const analytics = {
    rentals: { total: 152, change: 15, period: 'month' },
    bookmarks: { total: 287, change: 22, period: 'month' },
    reviews: { count: 45, average: 4.7, change: 12, period: 'month' },
    revenue: { total: '$24,500', change: 18, period: 'month' }
  };

  const notifications = [
    { id: 1, read: false },
    { id: 2, read: true }
  ];

  const bookings = [
    { 
      id: 'BOOK-001', 
      customer: 'John Doe', 
      vehicle: 'Electric Bike X1', 
      vehicleId: 'VEH-123',
      startDate: '2024-04-15',
      endDate: '2024-04-16',
      total: '$75',
      status: 'upcoming',
      timeAgo: '2 hours ago'
    },
    { 
      id: 'BOOK-002', 
      customer: 'Jane Smith', 
      vehicle: 'Mountain Bike Pro', 
      vehicleId: 'VEH-456',
      startDate: '2024-04-14',
      endDate: '2024-04-14',
      total: '$45',
      status: 'active',
      timeAgo: 'Yesterday'
    }
  ];

  const reviews = [
    {
      id: 'REV-001',
      user: 'Sarah Johnson',
      rating: 5,
      date: '2024-04-10',
      comment: 'Great bike and excellent service!',
      replied: false
    },
    {
      id: 'REV-002',
      user: 'Mike Peterson',
      rating: 4,
      date: '2024-04-08',
      comment: 'Enjoyed my ride, bike was in good condition.',
      replied: true
    }
  ];


  const handleVehicleTypeSelect = (type) => {
    console.log(`Selected vehicle type: ${type}`);
    setShowVehicleTypeModal(false);
  };

  const BikeDetailModal = ({ bike, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
    // Parse technical specifications
    const parseTechnicalSpecs = (specs) => {
      return specs.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          const parts = line.split(/\s(.+)/).filter(Boolean);
          return {
            label: parts[0]?.trim() || '',
            value: parts[1]?.trim() || ''
          };
        });
    };
  
    const technicalSpecs = parseTechnicalSpecs(bike.TechnicalSpecifications);
  
    const handleNextImage = () => {
      setCurrentImageIndex((prev) => 
        (prev + 1) % bike.imageUrl.length
      );
    };
  
    const handlePrevImage = () => {
      setCurrentImageIndex((prev) => 
        prev === 0 ? bike.imageUrl.length - 1 : prev - 1
      );
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{bike.name} Bike Details</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-800"
            >
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          </div>
  
          {/* Modal Content */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Image Gallery */}
            <div className="w-full md:w-1/2 relative">
              <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
                <img 
                  src={bike.imageUrl[currentImageIndex]} 
                  alt={`${bike.type} bike`} 
                  className="w-full h-full object-cover"
                />
                {bike.imageUrl.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 rounded-full p-2 hover:bg-white/75"
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 rounded-full p-2 hover:bg-white/75"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </>
                )}
              </div>
              {/* Image Thumbnails */}
              <div className="flex justify-center space-x-2 p-2 overflow-x-auto">
                {bike.imageUrl.map((img, index) => (
                  <button 
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-md overflow-hidden ${
                      index === currentImageIndex ? 'ring-2 ring-green-500' : ''
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
  
            {/* Bike Details */}
            <div className="w-full md:w-1/2 p-4 sm:p-6 overflow-y-auto">
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Model</span>
                    <p className="font-medium">{bike.model}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Price</span>
                    <p className="font-medium">{bike.price}</p>
                  </div>
                </div>
  
                {/* Description */}
                <div>
                  <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-2">Description</h3>
                  <p className="text-sm sm:text-base text-gray-600">{bike.details}</p>
                </div>
  
                {/* Technical Specifications */}
                <div>
                  <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-2">Technical Specifications</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <tbody>
                        {technicalSpecs.map((spec, index) => (
                          <tr 
                            key={index} 
                            className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                          >
                            <td className="p-2 text-xs sm:text-sm text-gray-600 font-medium">{spec.label}</td>
                            <td className="p-2 text-xs sm:text-sm text-gray-800">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
  
                <div className="mt-6">
                  <button 
                    className="w-full bg-green-600 text-white font-medium py-3 rounded-lg hover:bg-green-700"
                    onClick={() => {
                      onClose();
                      window.location.href = `/bookbikeID`;
                    }}
                  >
                    Book Now
                  </button>
             
</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const AddBikeModal = ({ onClose, onAddBike }) => {
    const [newBike, setNewBike] = useState({
      name: '',
      model: '',
      type: '',
      price: '',
      details: '',
      imageUrl: [],
      TechnicalSpecifications: ''
    });
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewBike(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
      const imageUrls = files.map(() => "/api/placeholder/400/320");
      setNewBike(prev => ({
        ...prev,
        imageUrl: [...prev.imageUrl, ...imageUrls]
      }));
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onAddBike(newBike);
      onClose();
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-800">Add New Bike</h2>
              <button 
                type="button"
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-800"
              >
                <XCircle className="h-8 w-8" />
              </button>
            </div>
  
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bike Name</label>
                <input
                  type="text"
                  name="name"
                  value={newBike.name}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  name="model"
                  value={newBike.model}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
  
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <input
                  type="text"
                  name="type"
                  value={newBike.type}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="text"
                  name="price"
                  value={newBike.price}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="details"
                value={newBike.details}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 h-24"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Technical Specifications</label>
              <textarea
  name="TechnicalSpecifications"
  value={newBike.TechnicalSpecifications}
  onChange={handleInputChange}
  className="w-full border rounded-lg px-3 py-2 h-24"
  required
  placeholder={'Format: Label Value (one specification per line)\nExample:\nChassis 27.5" aluminum suspension\nMotor 48V-250W XP (100Nm)'}
/>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full border rounded-lg px-3 py-2"
              />
              {newBike.imageUrl.length > 0 && (
                <div className="mt-4 flex space-x-2 overflow-x-auto">
                  {newBike.imageUrl.map((url, index) => (
                    <img 
                      key={index} 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="h-20 w-20 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}
            </div>
  
            <div className="flex justify-end space-x-4 border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Bike
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming': return 'bg-blue-100 text-blue-600';
      case 'active': return 'bg-green-100 text-green-600';
      case 'completed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r z-10">
        <div className="flex items-center justify-center h-20 border-b">
        <div className="flex items-center">
            <Link to="/" className="flex items-center">
            <img 
                src="/logo.png" 
                alt="San Lorenzo Nuovo Logo" 
                className="h-16 w-auto mr-3" 
              />
              <span className="font-bold text-lg text-[#22c55e]">Smart AppKey</span>
            </Link>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 px-2 space-y-1">
            {/* Navigation buttons */}
            {[
              { tab: 'overview', icon: Home, label: 'Overview' },
              { tab: 'vehicles', icon: Bike, label: 'Vehicles' },
              { 
                tab: 'bookings', 
                icon: Calendar, 
                label: 'Bookings', 
                badge: bookings.filter(booking => booking.status === 'upcoming').length 
              },
              { 
                tab: 'reviews', 
                icon: Star, 
                label: 'Reviews', 
                badge: reviews.filter(review => !review.replied).length 
              },
              { tab: 'analytics', icon: BarChart, label: 'Analytics' },
              { tab: 'settings', icon: Settings, label: 'Settings' },
              { tab: 'help', icon: HelpCircle, label: 'Help & Support' }
            ].map(({ tab, icon: Icon, label, badge }) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                  activeTab === tab
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${
                  activeTab === tab ? 'text-green-500' : 'text-gray-500'
                }`} />
                {label}
                {badge > 0 && (
                  <span className={`ml-auto ${
                    tab === 'bookings' ? 'bg-blue-100 text-blue-600' : 
                    tab === 'reviews' ? 'bg-yellow-100 text-yellow-600' : ''
                  } px-2 py-0.5 rounded-full text-xs`}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <button className="flex items-center text-sm text-gray-700 w-full px-3 py-2 rounded-md hover:bg-gray-100">
            <LogOut className="mr-3 h-5 w-5 text-gray-500" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
              <img 
                src="/logo.png" 
                alt="San Lorenzo Nuovo Logo" 
                className="h-16 w-auto mr-3" 
              />
                <span className="ml-2 text-xl font-bold text-green-600">Smart AppKey</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {/* Mobile navigation buttons */}
                {[
                  { tab: 'overview', icon: Home, label: 'Overview' },
                  { tab: 'vehicles', icon: Bike, label: 'Vehicles' },
                  { 
                    tab: 'bookings', 
                    icon: Calendar, 
                    label: 'Bookings', 
                    badge: bookings.filter(booking => booking.status === 'upcoming').length 
                  },
                  { 
                    tab: 'reviews', 
                    icon: Star, 
                    label: 'Reviews', 
                    badge: reviews.filter(review => !review.replied).length 
                  },
                  { tab: 'analytics', icon: BarChart, label: 'Analytics' },
                  { tab: 'settings', icon: Settings, label: 'Settings' },
                  { tab: 'help', icon: HelpCircle, label: 'Help & Support' }
                ].map(({ tab, icon: Icon, label, badge }) => (
                  <button 
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setMobileMenuOpen(false);
                    }}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                      activeTab === tab
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${
                      activeTab === tab ? 'text-green-500' : 'text-gray-500'
                    }`} />
                    {label}
                    {badge > 0 && (
                      <span className={`ml-auto ${
                        tab === 'bookings' ? 'bg-blue-100 text-blue-600' : 
                        tab === 'reviews' ? 'bg-yellow-100 text-yellow-600' : ''
                      } px-2 py-0.5 rounded-full text-xs`}>
                        {badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="flex-shrink-0 p-4 border-t">
              <button className="flex items-center text-sm text-gray-700 w-full px-3 py-2 rounded-md hover:bg-gray-100">
                <LogOut className="mr-3 h-5 w-5 text-gray-500" />
                Log Out
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 w-14"></div>
        </div>
      )}

      {/* Main content area */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top navigation bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Mobile menu toggle */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-900 focus:outline-none"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <span className="ml-3 text-lg font-medium text-gray-900">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </span>
            </div>
            
            {/* Desktop page title */}
            <div className="hidden md:block">
              <div className="text-xl font-semibold text-gray-900">
                {activeTab === 'overview' && 'Overview'}
                {activeTab === 'vehicles' && 'Vehicle Management'}
                {activeTab === 'bookings' && 'Booking Management'}
                {activeTab === 'reviews' && 'Customer Reviews'}
                {activeTab === 'analytics' && 'Business Analytics'}
                {activeTab === 'settings' && 'Account Settings'}
                {activeTab === 'help' && 'Help & Support'}
              </div>
            </div>
            
            {/* Top right navigation */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-1 text-gray-500 hover:text-gray-900 focus:outline-none relative">
                  <Bell className="h-6 w-6" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
              </div>
              
              <div className="border-l pl-4 h-8"></div>
              
              <div className="flex items-center">
                <div className="hidden md:block mr-3">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">admin@ecobike.com</p>
                </div>
                <img 
                  src="/Business.png" 
                  alt="User" 
                  className="h-8 w-8 rounded-full" 
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          {/* Conditionally render tabs */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Total Rentals</p>
                  <p className="text-xl font-semibold text-gray-800">{analytics.rentals.total}</p>
                  <p className="text-xs text-green-600">↑ {analytics.rentals.change}% from last {analytics.rentals.period}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-xl font-semibold text-gray-800">{analytics.revenue.total}</p>
                  <p className="text-xs text-green-600">↑ {analytics.revenue.change}% from last {analytics.revenue.period}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Customer Reviews</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-gray-800">{analytics.reviews.count}</p>
                    <div className="ml-2 flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm ml-1">{analytics.reviews.average}</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-600">↑ {analytics.reviews.change} new this {analytics.reviews.period}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Bookmarked</p>
                  <p className="text-xl font-semibold text-gray-800">{analytics.bookmarks.total}</p>
                  <p className="text-xs text-green-600">↑ {analytics.bookmarks.change}% from last {analytics.bookmarks.period}</p>
                </div>
              </div>

              {/* Business Description Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">About EcoBike Rentals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">Our Mission</h3>
                    <p className="text-gray-600 mb-4">
                      EcoBike Rentals is committed to transforming urban mobility by providing sustainable, 
                      eco-friendly transportation solutions. We believe in reducing carbon emissions 
                      and promoting healthier, more accessible city transportation.
                    </p>
                    
                    <h3 className="text-md font-medium text-gray-700 mb-2">Our Fleet</h3>
                    <p className="text-gray-600">
                      We offer a diverse range of bikes to meet every urban traveler's needs:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 mt-2">
                      <li>Electric Bikes: Pedal-assist technology for effortless city riding</li>
                      <li>Mountain Bikes: Robust options for adventure and off-road exploration</li>
                      <li>City Cycles: Comfortable, practical bikes for daily commutes</li>
                      <li>E-Motorcycles: High-performance electric motorcycles</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">Why Choose EcoBike?</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">Eco-Friendly</h4>
                          <p className="text-xs text-gray-600">Zero-emission vehicles that help reduce urban carbon footprint</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">Advanced Technology</h4>
                          <p className="text-xs text-gray-600">Latest electric and smart bike technologies</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-purple-100 p-2 rounded-full mr-3 mt-1">
                          <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">Flexible Pricing</h4>
                          <p className="text-xs text-gray-600">Affordable hourly, daily, and weekly rental plans</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
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
                            <h1 className="text-lg font-medium">Bike Inventory</h1>
                          
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <select className="border rounded-lg px-3 py-1.5 text-sm bg-white w-full sm:w-auto">
                      <option>All Types</option>
                      <option>SUV</option>
                      <option>I-D7</option>
                    </select>
                    <button 
                      onClick={() => setIsAddBikeModalOpen(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-full flex items-center justify-center sm:justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Add Bike</span>
                    </button>
                  </div>
                </div>

                {/* Bike Inventory List */}
                <div className="space-y-4">
              

{bikes.map((bike) => (
  <div 
    key={bike.id}
    className="bg-green-50 rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    onClick={() => setSelectedBike(bike)} // This is the important line to ensure clicking sets the selected bike
  >
    <div className="mr-4">
      <div className="w-16 h-16 bg-white rounded-md flex items-center justify-center overflow-hidden">
        <img
          src={bike.imageUrl[0]}
          alt={`${bike.type} bike`}
          className="h-12 w-auto"
        />
      </div>
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium text-sm">{bike.id}</div>
          <div className="text-xs text-gray-600">{bike.model}</div>
          <div className="text-xs text-gray-500">{bike.specs}</div>
        </div>
        <div>
          <span 
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              bike.available 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {bike.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
    </div>
    <div className="ml-4 flex space-x-2">
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Add this to prevent parent click handler from firing
          setSelectedBike(bike);
        }}
        className="bg-blue-50 text-blue-600 p-2 rounded-full hover:bg-blue-100"
        title="View Bike Details"
      >
        <FileEdit className="h-4 w-4" />
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Add this to prevent parent click handler from firing
          handleDeleteBike(bike.id);
        }}
        className="bg-red-50 text-red-600 p-2 rounded-full hover:bg-red-100"
        title="Remove Bike"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  </div>
))}
                </div>

                {/* No Bikes Placeholder */}
                {bikes.length === 0 && (
                  <div className="text-center py-12">
                    <Bike className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No bikes in inventory</h3>
                    <p className="mt-1 text-sm text-gray-500">Start by adding your first bike to the rental fleet.</p>
                    <div className="mt-6">
                      <button 
                        onClick={() => setIsAddBikeModalOpen(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
                      >
                        Add First Bike
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modals */}
              {selectedBike && (
                <BikeDetailModal 
                  bike={selectedBike} 
                  onClose={() => setSelectedBike(null)} 
                />
              )}

              {isAddBikeModalOpen && (
                <AddBikeModal 
                  onClose={() => setIsAddBikeModalOpen(false)}
                  onAddBike={handleAddBike}
                />
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Booking Management</h2>
                    <p className="text-sm text-gray-500">View and manage customer bookings</p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <select className="border rounded-lg px-3 py-1.5 text-sm bg-white">
                      <option>All Bookings</option>
                      <option>Upcoming</option>
                      <option>Active</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                </div>
                
                {/* Bookings List */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booking ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dates
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking.customer}</div>
                            <div className="text-xs text-gray-500">{booking.timeAgo}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{booking.vehicle}</div>
                            <div className="text-xs text-gray-500">{booking.vehicleId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{booking.startDate}</div>
                            {booking.startDate !== booking.endDate && (
                              <div className="text-xs text-gray-500">to {booking.endDate}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-blue-600 hover:text-blue-900">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* No Bookings Placeholder */}
                {bookings.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No bookings found</h3>
                    <p className="mt-1 text-sm text-gray-500">Bookings will appear here when customers make reservations.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Customer Reviews</h2>
                    <p className="text-sm text-gray-500">View and respond to customer feedback</p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <select className="border rounded-lg px-3 py-1.5 text-sm bg-white">
                      <option>All Reviews</option>
                      <option>Needs Reply</option>
                      <option>Replied</option>
                      <option>5 Stars</option>
                      <option>4 Stars</option>
                      <option>3 Stars or less</option>
                    </select>
                  </div>
                </div>
                
                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div 
                      key={review.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{review.user}</p>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                            <span className="ml-2 text-xs text-gray-500">{review.date}</span>
                          </div>
                        </div>
                        <span 
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            review.replied
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {review.replied ? 'Replied' : 'Needs Reply'}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-gray-700">{review.comment}</p>
                      {!review.replied && (
                        <div className="mt-4 flex justify-end">
                          <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                            Reply to Review
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* No Reviews Placeholder */}
                {reviews.length === 0 && (
                  <div className="text-center py-12">
                    <Star className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No reviews yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Reviews will appear here when customers provide feedback.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Business Analytics</h2>
                <p className="text-gray-600">This section will contain detailed analytics and reporting features for your bike rental business.</p>
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg mt-6">
                  <div className="text-center">
                    <BarChart className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Dashboard</h3>
                    <p className="mt-1 text-sm text-gray-500">Coming soon...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-3">Business Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Name
                        </label>
                        <input 
                          type="text"
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          value={businessProfile.name}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Type
                        </label>
                        <input 
                          type="text"
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          value={businessProfile.type}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input 
                          type="text"
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          value={businessProfile.address}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input 
                          type="text"
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          value={businessProfile.phone}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Description
                      </label>
                      <textarea 
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={businessProfile.description}
                        readOnly
                        rows="3"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-3">Business Hours</h3>
                    <div className="space-y-2">
                      {Object.entries(businessProfile.hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between items-center py-1 border-b">
                          <span className="text-sm capitalize">{day}</span>
                          <span className="text-sm">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button 
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Help & Support</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-3">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">How do I add a new bike to my inventory?</h4>
                        <p className="mt-1 text-sm text-gray-600">
                          Go to the "Vehicles" tab and click on the "Add Bike" button. Fill in the required details
                          about your bike including specifications, price, and photos.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">How do I respond to customer reviews?</h4>
                        <p className="mt-1 text-sm text-gray-600">
                          Navigate to the "Reviews" tab, find the review you want to respond to, and click the "Reply" button.
                          Write your response and submit it to be visible to the customer.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">How can I manage my business hours?</h4>
                        <p className="mt-1 text-sm text-gray-600">
                          You can update your business hours in the "Settings" tab under the "Business Profile" section.
                          Click "Edit Profile" to make changes.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-3">Contact Support</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Need additional help? Our support team is available to assist you.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Email Support</span>
                          <p className="text-xs text-gray-600">support@smartappkey.com</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.515 5.515 5.242 10 11.5 10c6.351 0 11.5-5.149 11.5-11.5 0-6.351-5.149-11.5-11.5-11.5-2.386 0-4.681.777-6.613 2.193L4.63 3.382A1 1 0 013.12 2.198L1.62 5.506z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Phone Support</span>
                          <p className="text-xs text-gray-600">+1 (555) 987-6543</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-full mr-3">
                          <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Live Chat</span>
                          <p className="text-xs text-gray-600">Available Monday-Friday, 9 AM - 5 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Contact Support Team
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BusinessDashboard;
