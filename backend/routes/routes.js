// routes/routes.js - Improved error handling
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const OTP = require('../models/OTP');

// Authentication middleware
const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'your_jwt_secret_key_here'
      );
      
      req.user = {
        userId: payload.userId,
        email: payload.email,
        userType: payload.userType
      };
      
      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication invalid'
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// ===== AUTH ROUTES =====

// Register
router.post('/auth/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phoneNumber, 
      userType,
      interests 
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!phoneNumber) missingFields.push('phoneNumber');
    if (!userType) missingFields.push('userType');
    if (!interests || !Array.isArray(interests) || interests.length === 0) missingFields.push('interests');
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields', 
        missingFields 
      });
    }

    // Validate user type
    const validUserTypes = ['resident', 'tourist', 'business'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid user type. Must be one of: ${validUserTypes.join(', ')}` 
      });
    }

    // Check if email already exists
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }

    // Create user with try-catch for better error handling
    let user;
    try {
      user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        userType,
        interests
      });
    } catch (error) {
      console.error('User creation error:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }

    // Create user profile
    try {
      const profileData = {
        user: user._id
      };

      // Add specific fields based on user type
      if (userType === 'business') {
        profileData.businessInfo = {};
      } else if (userType === 'resident') {
        profileData.residentInfo = {};
      } else if (userType === 'tourist') {
        profileData.touristInfo = {};
      }

      await Profile.create(profileData);
    } catch (error) {
      console.error('Profile creation error:', error);
      // Don't fail the whole registration process if profile creation fails
      // Instead log it and continue
    }

    // Generate token
    const token = user.createJWT();

    console.log('Registration successful for user ID:', user._id);
    
    res.status(201).json({ 
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType
      },
      token 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    console.log('Login request received');
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = user.createJWT();

    console.log('Login successful for user ID:', user._id);
    
    res.status(200).json({ 
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType
      },
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
});

// Generate OTP
router.post('/auth/otp/generate', async (req, res) => {
  try {
    console.log('OTP generation request received');
    
    const { phoneNumber, userId } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide phone number' 
      });
    }

    // Generate a new OTP (4-digit number)
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set expiry time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Store OTP in database
    await OTP.create({
      userId: userId || null,
      phoneNumber,
      code,
      expiresAt
    });

    console.log('OTP generated for phone number:', phoneNumber);
    
    // In a real application, you would send the OTP via SMS
    res.status(200).json({ 
      success: true,
      message: 'OTP sent successfully',
      // Include the OTP in the response for testing purposes
      // Remove this in production
      otp: code,
      expiresAt
    });
  } catch (error) {
    console.error('OTP generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate OTP', 
      error: error.message 
    });
  }
});

// Verify OTP
router.post('/auth/otp/verify', async (req, res) => {
  try {
    console.log('OTP verification request received');
    
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide phone number and OTP code' 
      });
    }

    // Find the OTP
    const otp = await OTP.findOne({
      phoneNumber,
      code,
      expiresAt: { $gt: new Date() }
    });

    if (!otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    // If there's a userId associated with this OTP, mark user as verified
    if (otp.userId) {
      await User.findByIdAndUpdate(otp.userId, { verified: true });
      console.log('User verified:', otp.userId);
    }

    // Delete the used OTP
    await OTP.findByIdAndDelete(otp._id);

    res.status(200).json({ 
      success: true,
      message: 'OTP verified successfully' 
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP', 
      error: error.message 
    });
  }
});

// ===== USER ROUTES (Protected) =====

// Get current user profile
router.get('/users/me', authenticateUser, async (req, res) => {
  try {
    console.log('Get user profile request received');
    
    const userId = req.user.userId;
    
    const user = await User.findById(userId)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const profile = await Profile.findOne({ user: userId });

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
});

// Update user profile
router.patch('/users/profile', authenticateUser, async (req, res) => {
  try {
    console.log('Update profile request received');
    
    const userId = req.user.userId;
    const { firstName, lastName, phoneNumber, email } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    
    // If email is being updated, check if it's already in use
    if (email !== undefined) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      updateData.email = email;
    }
    
    // Update the user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('Profile updated for user ID:', userId);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Update user interests
router.patch('/users/interests', authenticateUser, async (req, res) => {
  try {
    console.log('Update interests request received');
    
    const userId = req.user.userId;
    const { interests } = req.body;
    
    // Validate interests
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one interest'
      });
    }
    
    // Update the user
    const user = await User.findByIdAndUpdate(
      userId,
      { interests },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('Interests updated for user ID:', userId);
    
    res.status(200).json({
      success: true,
      message: 'Interests updated successfully',
      interests: user.interests
    });
  } catch (error) {
    console.error('Update user interests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interests',
      error: error.message
    });
  }
});

module.exports = router;