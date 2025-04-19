// routes/userRoutes.js - User profile and management routes

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Import middleware
const validateRequest = require('../middleware/validate-request');

// Import user controller functions (only reference functions that exist)
// Replace these with your actual controller functions
const {
  getUserProfile,
  updateUserProfile,
  updateUserInterests
} = require('../controllers/userController');

// Get user profile
router.get('/profile', authenticateUser, getUserProfile);

// Update user profile (common fields)
router.patch(
  '/profile',
  authenticateUser,
  [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('phoneNumber').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
  ],
  validateRequest,
  updateUserProfile
);

// Update user interests
router.patch(
  '/interests',
  authenticateUser,
  [
    body('interests').isArray({ min: 1 }).withMessage('At least one interest is required')
  ],
  validateRequest,
  updateUserInterests
);

module.exports = router;