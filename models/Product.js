const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  brand: String,
  size: String,
  color: String,
  imageUrl: String
}, {
  timestamps: true // adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Product', productSchema);
