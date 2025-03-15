// models/Profile.js
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  // For business users
  businessInfo: {
    companyName: { type: String, default: '' },
    businessType: { type: String, default: '' },
    description: { type: String, default: '' },
    openingHours: { type: String, default: '' }
  },
  // For resident users
  residentInfo: {
    neighborhood: { type: String, default: '' },
    residencePeriod: { type: String, default: '' }
  },
  // For tourist users
  touristInfo: {
    visitDuration: { type: String, default: '' },
    accommodationType: { type: String, default: '' },
    travelGroup: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);