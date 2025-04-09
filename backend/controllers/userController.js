// controllers/authController.js - Enhanced implementation

const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password,
      userType,
      interests,
      businessType
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!userType) missingFields.push('userType');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields',
        missingFields
      });
    }

    // Validate email format
    const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
        invalidFields: ['email']
      });
    }

    // Validate password strength (at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        invalidFields: ['password']
      });
    }

    // Additional validation for specific user types
    if ((userType === 'resident' || userType === 'tourist') && (!interests || !Array.isArray(interests) || interests.length === 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select at least one interest',
        missingFields: ['interests']
      });
    }

    if (userType === 'business' && !businessType) {
      return res.status(400).json({
        success: false,
        message: 'Please select a business type',
        missingFields: ['businessType']
      });
    }

    // Check if email already exists
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists',
        duplicateFields: ['email']
      });
    }

    // Generate a random phone number for backend compatibility
    const phoneNumber = "+1" + Math.floor(1000000000 + Math.random() * 9000000000);

    // Create user with all verified users
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Hashing should be handled in the User model pre-save hook
      phoneNumber,
      userType,
      interests: interests || [],
      verified: true // Skip verification since we removed OTP
    });

    // Create user profile based on user type
    const profileData = {
      user: user._id,
      bio: '',
      location: '',
    };

    // Add specific fields based on user type
    if (userType === 'business') {
      profileData.businessInfo = {
        companyName: '',
        businessType: businessType || '',
        description: '',
        openingHours: ''
      };
    } else if (userType === 'resident') {
      profileData.residentInfo = {
        neighborhood: '',
        residencePeriod: ''
      };
    } else if (userType === 'tourist') {
      profileData.touristInfo = {
        visitDuration: '',
        accommodationType: '',
        travelGroup: ''
      };
    }

    await Profile.create(profileData);

    // Generate token
    const token = user.createJWT();

    // Return success response with user data and token
    res.status(201).json({ 
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        interests: user.interests
      },
      token 
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate field value entered',
        field: Object.keys(error.keyValue)[0]
      });
    }
    
    // General server error
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed',
      error: error.message 
    });
  }
};

/**
 * Login a user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password',
        missingFields: !email ? ['email'] : !password ? ['password'] : ['email', 'password']
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No account found with this email address',
        code: 'auth/user-not-found'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials',
        code: 'auth/wrong-password'
      });
    }

    // Generate token
    const token = user.createJWT();

    // Get user profile
    const profile = await Profile.findOne({ user: user._id }).select('-__v');

    // Return success with token and user data
    res.status(200).json({ 
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        interests: user.interests,
        createdAt: user.createdAt
      },
      profile: profile ? {
        id: profile._id,
        bio: profile.bio,
        location: profile.location
      } : null,
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed', 
      error: error.message 
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find user without password
    const user = await User.findById(userId)
      .select('-password -__v');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Find user profile
    const profile = await Profile.findOne({ user: userId })
      .select('-__v');

    // Return user and profile data
    res.status(200).json({ 
      success: true,
      user, 
      profile
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user profile', 
      error: error.message 
    });
  }
};

/**
 * Update user password
 * @route PATCH /api/auth/password
 * @access Private
 */
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
        missingFields: !currentPassword ? ['currentPassword'] : ['newPassword']
      });
    }
    
    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updatePassword
};