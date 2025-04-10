// src/models/BikeRentalModel.js

// This would be your database schema if using MongoDB/Mongoose
// You could adapt this to your preferred database system

/**
 * Bike Schema
 * 
 * Represents a bike in the inventory that can be rented
 */
const BikeSchema = {
    bike_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['SUV', 'I-D7'] // Only allow these bike types
    },
    specs: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: '/bike-placeholder.png'
    },
    available: {
      type: Boolean,
      default: true
    },
    condition: {
      type: String,
      enum: ['New', 'Excellent', 'Good', 'Fair', 'Needs Repair'],
      default: 'Excellent'
    },
    lastMaintenance: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  };
  
  /**
   * Rental Schema
   * 
   * Represents a bike rental booking
   */
  const RentalSchema = {
    rental_id: {
      type: String,
      required: true,
      unique: true
    },
    bike_id: {
      type: String,
      required: true,
      ref: 'Bike' // Reference to the Bike model
    },
    customer: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      }
    },
    rentalDate: {
      type: Date,
      required: true
    },
    rentalTime: {
      type: String,
      required: true
    },
    returnDate: Date,
    duration: {
      type: Number,
      default: 1, // Default rental duration in days
      min: 1
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Picked Up', 'Returned', 'Cancelled'],
      default: 'Pending'
    },
    notes: String,
    totalPrice: {
      type: Number,
      default: 0
    },
    deposit: {
      type: Number,
      default: 0
    },
    depositReturned: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  };
  
  /**
   * API Endpoints for Bike Rental
   * 
   * These would be implemented in your backend API
   */
  const BikeRentalEndpoints = {
    // Bike Management
    '/api/bikes': {
      GET: 'Get all bikes in inventory',
      POST: 'Add a new bike to inventory'
    },
    '/api/bikes/:id': {
      GET: 'Get details of a specific bike',
      PUT: 'Update bike details',
      DELETE: 'Remove a bike from inventory'
    },
    
    // Rental Management
    '/api/rentals': {
      GET: 'Get all rentals (with filtering options)',
      POST: 'Create a new rental booking'
    },
    '/api/rentals/:id': {
      GET: 'Get details of a specific rental',
      PUT: 'Update rental status or details',
      DELETE: 'Cancel a rental'
    },
    '/api/rentals/customer/:email': {
      GET: 'Get all rentals for a specific customer'
    },
    '/api/availability': {
      GET: 'Check bike availability for a specific date'
    }
  };
  
  export { BikeSchema, RentalSchema, BikeRentalEndpoints };