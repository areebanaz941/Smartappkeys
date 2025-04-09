// models/Route.js
const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  name: String,
  description: String,
  fileName: String,
  roadType: String,
  difficulty: String,
  path: [[Number]],
  boundingBox: {
    minLng: Number,
    maxLng: Number,
    minLat: Number,
    maxLat: Number
  },
  stats: {
    totalDistance: Number,
    maxElevation: Number,
    minElevation: Number,
    elevationGain: Number,
    numberOfPoints: Number
  }
}, { 
  timestamps: true 
});

// Pre-save hook to calculate and update boundingBox
RouteSchema.pre('save', function(next) {
  if (this.path && this.path.length > 0) {
    // Initialize min/max values
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    // Calculate bounds from path coordinates
    this.path.forEach(point => {
      const lng = point[0];
      const lat = point[1];
      
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });
    
    // Update boundingBox field
    this.boundingBox = { minLng, maxLng, minLat, maxLat };
  }
  next();
});

// Create indexes for query optimization
RouteSchema.index({ roadType: 1 });
RouteSchema.index({ 'boundingBox.minLng': 1 });
RouteSchema.index({ 'boundingBox.maxLng': 1 });
RouteSchema.index({ 'boundingBox.minLat': 1 });
RouteSchema.index({ 'boundingBox.maxLat': 1 });

module.exports = mongoose.model('Route', RouteSchema);