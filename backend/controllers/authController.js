// controllers/authController.js - Updated implementation

const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register User
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

    // Generate a random phone number for backend compatibility
    const phoneNumber = "+1" + Math.floor(1000000000 + Math.random() * 9000000000);

    if (!firstName || !lastName || !email || !password || !userType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Validate interests for non-business users
    if ((userType === 'resident' || userType === 'tourist') && (!interests || interests.length === 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select at least one interest' 
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

    // Create user with auto-generated phone number and set as verified
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Hashing should be handled in the User model
      phoneNumber, // Using the generated phone number
      userType,
      interests: interests || [],
      verified: true // Automatically verify user since we're skipping OTP
    });

    // Create user profile
    const profileData = {
      user: user._id
    };

    // Add specific fields based on user type
    if (userType === 'business') {
      profileData.businessInfo = {
        companyName: '',
        businessType: businessType || '', // Include businessType if provided
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
      error: error.message 
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
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
        message: 'Invalid credentials',
        code: 'auth/user-not-found' // Add this code for frontend handling
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
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
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