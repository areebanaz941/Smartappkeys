const mongoose = require('mongoose');

const RedemptionSchema = new mongoose.Schema({
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  redeemedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Redemption', RedemptionSchema);
