// controllers/userController.js - Basic implementation

const User = require('../models/User');
const Profile = require('../models/Profile');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user data excluding sensitive fields
    const user = await User.findById(userId)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get associated profile
    const profile = await Profile.findOne({ user: userId });
    
    res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

// Update user profile (common fields)
const updateUserProfile = async (req, res) => {
  try {
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
};

// Update user interests
const updateUserInterests = async (req, res) => {
  try {
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
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateUserInterests
};