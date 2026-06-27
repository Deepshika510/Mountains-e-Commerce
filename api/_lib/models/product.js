const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  mountain: { type: String, required: true },
  region: {
    type: String,
    required: true,
    enum: ['Himalayas', 'Andes', 'Alps', 'Rockies', 'Africa', 'Antarctica']
  },
  scale: { type: String, required: true },
  height_of_mountain_m: { type: Number },
  material: {
    type: String,
    enum: ['Resin', 'Wood', 'Metal', 'Plastic', 'Stone Powder'],
    required: true
  },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  image: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema)
