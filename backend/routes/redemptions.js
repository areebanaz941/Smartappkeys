const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const Redemption = require('../models/Redemption');
const User = require('../models/User');
const mongoose = require('mongoose');

router.get('/:qrCode/:userId', async (req, res) => {
  const { qrCode, userId: rawUserId } = req.params;
  const userId = rawUserId.trim();

  if (!qrCode || !userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid or missing parameters' });
  }

  try {
    const foundOffer = await Offer.findOne({ qrCode });
    const foundUser = await User.findById(userId);
    if (!foundOffer || !foundUser) {
      return res.status(404).json({ success: false, message: 'Invalid offer or user' });
    }

    const now = new Date();
    if ((foundOffer.validFrom && now < foundOffer.validFrom) ||
        (foundOffer.validUntil && now > foundOffer.validUntil)) {
      return res.status(400).json({ success: false, message: 'Offer not valid now' });
    }

    const alreadyUsed = await Redemption.findOne({ offerId: foundOffer._id, userId });
    if (alreadyUsed) {
      return res.status(400).json({ success: false, message: 'Offer already redeemed' });
    }

    await Redemption.create({ offerId: foundOffer._id, userId });
    return res.status(200).json({ success: true, message: 'Offer redeemed successfully' });
  } catch (err) {
    console.error('Redemption error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
