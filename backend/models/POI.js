// models/Poi.js
const mongoose = require('mongoose');

const poiSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['business', 'cultural', 'landscape', 'religious', 'landscape_religious'],
    index: true
  },
  type_it: { 
    type: String, 
    required: true 
  },
  type_en: { 
    type: String, 
    required: true 
  },
  coordinates: { 
    type: String, 
    required: true 
  },
  photo: { 
    type: String 
  },
  name_en: { 
    type: String, 
    required: true 
  },
  description_en: { 
    type: String 
  },
  name_it: { 
    type: String, 
    required: true 
  },
  description_it: { 
    type: String 
  },
  // New field for relevant_for
  relevant_for: {
    type: [String],
    enum: ['Resident', 'Guest', 'Business'],
    required: true  // Change from default: [] to required: true
  }
}, { timestamps: true });

// Add text indices for search functionality
poiSchema.index({ 
  name_en: 'text', 
  name_it: 'text', 
  type_en: 'text', 
  type_it: 'text',
  description_en: 'text',
  description_it: 'text',
  relevant_for: 'text'
});

module.exports = mongoose.model('Poi', poiSchema);