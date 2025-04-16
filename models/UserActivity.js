const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  viewedProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  lastViewedAt: { type: Date, default: Date.now }
});

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;
