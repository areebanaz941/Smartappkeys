// backend/scripts/add-offer.js

// How to use (from command line)
// ==============================
//npm run add-offer -- \
//  "Free Coffee" \
//  "Caffè gratuito" \
//  "Enjoy a free coffee at participating locations." \
//  "Goditi un caffè gratuito nei locali aderenti." \
//  0 \
//  "OFFER-FREE-COFFEE" \
//  0.5 \
//  "2025-04-01" \
//  "2025-12-31"

require('dotenv').config();
const mongoose = require('mongoose');
const Offer = require('../models/Offer');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const [,, ...args] = process.argv;

const offer = {
  name: {
    en: args[0] || "Sample Offer EN",
    it: args[1] || "Offerta di esempio IT"
  },
  description: {
    en: args[2] || "",
    it: args[3] || ""
  },
  price: Number(args[4]) || 0,
  qrCode: args[5] || `OFFER-${Math.random().toString(36).substring(7).toUpperCase()}`,
  successFee: Number(args[6]) || 0,
  validFrom: args[7] ? new Date(args[7]) : undefined,
  validUntil: args[8] ? new Date(args[8]) : undefined
};

Offer.create(offer)
  .then(doc => {
    console.log('✅ Offer created:', doc);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error creating offer:', err.message);
    mongoose.disconnect();
  });
