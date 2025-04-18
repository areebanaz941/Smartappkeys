const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
    name: {
      en: { type: String, required: true },
      it: { type: String, required: true }
    },
    description: {
      en: { type: String },
      it: { type: String }
    },
    price: Number,
    image: { type: String },
    qrCode: { type: String, unique: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    successFee: Number,
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Redemption' }],
    validFrom: Date,
    validUntil: Date
  });

module.exports = mongoose.model('Offer', OfferSchema);
