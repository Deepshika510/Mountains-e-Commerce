const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
    // e.g. "Mount Everest Miniature", "K2 Scale Model"
  },
  description: {
    type: String,
    required: true
  },
  mountain: {
    type: String,
    required: true
    // e.g. "Everest", "K2", "Kilimanjaro"
  },
  region: {
    type: String,
    required: true,
    enum: ['Himalayas', 'Andes', 'Alps', 'Rockies', 'Africa', 'Antarctica']
  },
  scale: {
    type: String,
    required: true
    // e.g. "1:1000", "1:5000", "1:10000"
  },
  height_of_mountain_m: {
    type: Number  // real mountain height in meters
  },
  material: {
    type: String,
    enum: ['Resin', 'Wood', 'Metal', 'Plastic', 'Stone Powder'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)