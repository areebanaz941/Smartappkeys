// controllers/authController.js - Basic implementation

const User = require('../models/User');
const OTP = require('../models/OTP');
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
      phoneNumber, 
      userType,
      interests 
    } = req.body;

    if (!firstName || !lastName || !email || !password || !phoneNumber || !userType || !interests) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
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

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Hashing should be handled in the User model
      phoneNumber,
      userType,
      interests
    });

    // Create user profile
    const profileData = {
      user: user._id
    };

    // Add specific fields based on user type
    if (userType === 'business') {
      profileData.businessInfo = {
        companyName: '',
        businessType: '',
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

// Generate OTP
const generateUserOTP = async (req, res) => {
  try {
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
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
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

module.exports = {
  register,
  login,
  generateUserOTP,
  verifyOTP,
  getCurrentUser
};