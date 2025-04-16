const mongoose = require('mongoose');

const userPurchaseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

module.exports = mongoose.model('UserPurchase', userPurchaseSchema);
