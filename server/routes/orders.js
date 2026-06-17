const express = require('express')
const Order = require('../models/order')
const protect = require('../middleware/authmiddleware')

const router = express.Router()

// POST create new order (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice, shippingPrice } = req.body

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No items in order' })
    }

    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      totalPrice,
      shippingPrice
    })

    res.status(201).json(order)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// GET my orders (protected)
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('orderItems.product', 'name image price mountain scale').sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// GET single order by ID (protected)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email').populate('orderItems.product', 'name image price mountain scale')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json(order)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// PATCH mark order as paid (protected)
router.patch('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) return res.status(404).json({ message: 'Order not found' })

    order.isPaid = true
    order.paidAt = Date.now()
    order.status = 'Processing'

    const updated = await order.save()
    res.json(updated)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// PATCH cancel order (protected)
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) return res.status(404).json({ message: 'Order not found' })

    if (order.status === 'Shipped' || order.status === 'Delivered') {
      return res.status(400).json({ message: 'Cannot cancel shipped or delivered order' })
    }

    order.status = 'Cancelled'
    const updated = await order.save()
    res.json(updated)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

module.exports = router