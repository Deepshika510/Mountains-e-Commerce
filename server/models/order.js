const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  mountain: String,
  scale: String,
  material: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  image: String
})

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    pincode: String,
    state: String,
    phone: String
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  shippingPrice: {
    type: Number,
    default: 99
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paidAt: Date,
  deliveredAt: Date
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)