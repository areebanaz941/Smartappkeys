import React from 'react';
import { X, ImagePlus } from 'lucide-react';

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

export default AddBikeModal;