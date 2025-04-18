const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const Redemption = require('../models/Redemption');
const User = require('../models/User');
const mongoose = require('mongoose');

// Redeem offer via QR code scanned by business
router.get('/redeem/:qrCode/:userId', async (req, res) => {
  const { qrCode, userId: rawUserId } = req.params;

  // Trim invisible characters if any
  const userId = rawUserId.trim();

  if (!qrCode || !userId) {
    return res.status(400).json({ success: false, message: 'Missing QR code or user ID' });
  }

  // Validate user ID format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID format' });
  }

  try {
    // Find offer by qrCode
    const foundOffer = await Offer.findOne({ qrCode });
    const foundUser = await User.findById(userId);

    if (!foundOffer || !foundUser) {
      return res.status(404).json({ success: false, message: 'Invalid offer or user' });
    }

    // Check offer date validity
    const now = new Date();
    if (
      (foundOffer.validFrom && now < foundOffer.validFrom) ||
      (foundOffer.validUntil && now > foundOffer.validUntil)
    ) {
      return res.status(400).json({ success: false, message: 'Offer not valid right now' });
    }

    // Optional: Prevent multiple redemptions
    const alreadyUsed = await Redemption.findOne({ offerId: foundOffer._id, userId });
    if (alreadyUsed) {
      return res.status(400).json({ success: false, message: 'Offer already redeemed by this user' });
    }

    // Create redemption record
    await Redemption.create({ offerId: foundOffer._id, userId });

    return res.status(200).json({ success: true, message: 'Offer redeemed successfully' });

  } catch (err) {
    console.error('Redemption error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all active offers
router.get('/', async (req, res) => {
    try {
      const now = new Date();
  
      const offers = await Offer.find({
        $or: [
          { validFrom: { $exists: false }, validUntil: { $exists: false } },
          {
            validFrom: { $lte: now },
            validUntil: { $gte: now }
          }
        ]
      }).populate('partnerId', 'firstName lastName businessName');      
  
      res.status(200).json({ success: true, offers });
    } catch (err) {
      console.error('Error fetching offers:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
});
  
module.exports = router;
