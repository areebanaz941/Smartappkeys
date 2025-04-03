// models/BikeRoute.js
const mongoose = require('mongoose');

const bikeRouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Route description is required']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: 0
  },
  elevationGain: {
    type: Number,
    default: 0
  },
  estimatedTime: {
    type: Number,
    required: [true, 'Estimated time is required'],
    min: 1
  },
  startPoint: {
    type: String,
    required: [true, 'Starting point is required']
  },
  endPoint: {
    type: String,
    required: [true, 'End point is required']
  },
  tags: {
    type: [String],
    default: []
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  gpxFile: {
    type: String,
    default: null
  },
  // Track popularity for statistics
  popularity: {
    type: Number,
    default: 0
  },
  // GPS coordinates as array of arrays [longitude, latitude, elevation]
  path: {
    type: [[Number]],
    default: []
  },
  // Bounding box for the route - helps with geographic queries
  boundingBox: {
    minLng: Number,
    maxLng: Number,
    minLat: Number,
    maxLat: Number
  },
  // Additional route stats
  stats: {
    maxElevation: {
      type: Number,
      default: 0
    },
    minElevation: {
      type: Number,
      default: 0
    },
    averageSpeed: {
      type: Number,
      default: 0
    }
  },
  // Terrain type
  terrain: {
    type: String,
    enum: ['road', 'gravel', 'mountain', 'mixed'],
    default: 'road'
  },
  // Surface type
  surface: {
    type: String,
    enum: ['paved', 'unpaved', 'mixed'],
    default: 'paved'
  },
  // Season recommendation
  seasonRecommendation: {
    type: [String],
    enum: ['spring', 'summer', 'fall', 'winter', 'all'],
    default: ['all']
  },
  // Route author/creator
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // For circular routes
  isCircular: {
    type: Boolean,
    default: false
  },
  // Points of interest along the route
  pointsOfInterest: [{
    name: String,
    description: String,
    coordinates: [Number], // [longitude, latitude]
    type: {
      type: String,
      enum: ['viewpoint', 'rest_area', 'water_source', 'food', 'landmark', 'other'],
      default: 'other'
    }
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Pre-save hook to calculate and update boundingBox
bikeRouteSchema.pre('save', function(next) {
  if (this.path && this.path.length > 0) {
    // Initialize min/max values
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    let minEle = Infinity, maxEle = -Infinity;
    
    // Calculate bounds from path coordinates
    this.path.forEach(point => {
      if (point.length >= 2) {
        const lng = point[0];
        const lat = point[1];
        const ele = point[2] || 0;
        
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        
        // Track elevation stats if available
        if (point.length >= 3) {
          minEle = Math.min(minEle, ele);
          maxEle = Math.max(maxEle, ele);
        }
      }
    });
    
    // Update boundingBox field
    this.boundingBox = {
      minLng: minLng !== Infinity ? minLng : null,
      maxLng: maxLng !== -Infinity ? maxLng : null,
      minLat: minLat !== Infinity ? minLat : null,
      maxLat: maxLat !== -Infinity ? maxLat : null
    };
    
    // Update elevation stats if available
    if (minEle !== Infinity && maxEle !== -Infinity) {
      this.stats.minElevation = minEle;
      this.stats.maxElevation = maxEle;
    }
    
    // Check if route is circular (start and end points are close)
    if (this.path.length > 1) {
      const start = this.path[0];
      const end = this.path[this.path.length - 1];
      
      if (start.length >= 2 && end.length >= 2) {
        // Calculate distance between start and end (simplified)
        const threshold = 0.001; // ~100m depending on latitude
        const isCircular = 
          Math.abs(start[0] - end[0]) < threshold && 
          Math.abs(start[1] - end[1]) < threshold;
        
        this.isCircular = isCircular;
      }
    }
  }
  next();
});

// Create a text index for search functionality
bikeRouteSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
});

// Create indexes for query optimization
bikeRouteSchema.index({ 'boundingBox.minLng': 1 });
bikeRouteSchema.index({ 'boundingBox.maxLng': 1 });
bikeRouteSchema.index({ 'boundingBox.minLat': 1 });
bikeRouteSchema.index({ 'boundingBox.maxLat': 1 });
bikeRouteSchema.index({ difficulty: 1 });
bikeRouteSchema.index({ distance: 1 });
bikeRouteSchema.index({ terrain: 1 });
bikeRouteSchema.index({ isPublic: 1 });
bikeRouteSchema.index({ popularity: -1 });

// Virtual for getting the total points count
bikeRouteSchema.virtual('pointCount').get(function() {
  return this.path ? this.path.length : 0;
});

// Instance method to get route as GeoJSON
bikeRouteSchema.methods.toGeoJSON = function() {
  const coordinates = this.path.map(point => {
    // Make sure we have at least longitude and latitude
    if (point.length >= 2) {
      return point.slice(0, 3); // [lng, lat, ele] or [lng, lat]
    }
    return null;
  }).filter(Boolean); // Remove any null entries
  
  return {
    type: 'Feature',
    properties: {
      name: this.name,
      description: this.description,
      difficulty: this.difficulty,
      distance: this.distance,
      elevationGain: this.elevationGain,
      estimatedTime: this.estimatedTime
    },
    geometry: {
      type: 'LineString',
      coordinates: coordinates
    }
  };
};

// Static method to find routes within a certain distance of a point
bikeRouteSchema.statics.findNearby = async function(lat, lng, radiusKm = 10) {
  // Convert radius to approximate degrees (rough estimation)
  const radiusLat = radiusKm / 111; // 1 degree latitude is approximately 111km
  const radiusLng = radiusKm / (111 * Math.cos(lat * Math.PI / 180)); // Adjust for longitude
  
  return this.find({
    $or: [
      {
        'boundingBox.minLat': { $lte: lat + radiusLat },
        'boundingBox.maxLat': { $gte: lat - radiusLat },
        'boundingBox.minLng': { $lte: lng + radiusLng },
        'boundingBox.maxLng': { $gte: lng - radiusLng }
      }
    ]
  });
};

const BikeRoute = mongoose.model('BikeRoute', bikeRouteSchema);

module.exports = BikeRoute;