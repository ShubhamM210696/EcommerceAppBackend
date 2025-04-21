// models/ViewedProduct.js
const mongoose = require('mongoose');

const viewedProductSchema = new mongoose.Schema({
  userId: String, // or ObjectId if using real users
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  viewedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ViewedProduct', viewedProductSchema);
