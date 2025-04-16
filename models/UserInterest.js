const mongoose = require('mongoose');

const userInterestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  brand: String,
  size: String,
  color: String,
}, { timestamps: true });

module.exports = mongoose.model('UserInterest', userInterestSchema);