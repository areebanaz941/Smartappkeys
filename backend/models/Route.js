const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  State: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  gpxFile: {
    filename: String,
    path: String,
    contentType: String
  },
  images: [{
    filename: String,
    path: String,
    thumbnailPath: String,
    contentType: String
  }],
  surfaceType: {
    type: String,
    enum: ['paved', 'unpaved', 'mixed']
  },
  distance: {
    type: Number
  },
  elevationProfile: {
    data: [Number],
    min: Number,
    max: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Route', RouteSchema);