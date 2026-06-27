const connectDB = require('../_lib/db')
const Order = require('../_lib/models/order')
const { getUserFromToken } = require('../_lib/auth')

module.exports = async function handler(req, res) {
  await connectDB()
  const user = getUserFromToken(req)
  if (!user) return res.status(401).json({ message: 'No token, access denied' })

  // Extract sub-path: /api/orders, /api/orders/myorders, /api/orders/:id/cancel, /api/orders/:id/pay
  const url = new URL(req.url, `http://${req.headers.host}`)
  const parts = url.pathname.split('/').filter(Boolean) // ['api', 'orders', ...]
  const segment1 = parts[2] || null // 'myorders' or orderId
  const segment2 = parts[3] || null // 'cancel' or 'pay'

  // POST /api/orders — create new order
  if (req.method === 'POST' && !segment1) {
    try {
      const { orderItems, shippingAddress, totalPrice, shippingPrice } = req.body
      if (!orderItems || orderItems.length === 0) return res.status(400).json({ message: 'No items in order' })
      const order = await Order.create({ user: user.id, orderItems, shippingAddress, totalPrice, shippingPrice })
      return res.status(201).json(order)
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message })
    }
  }

  // GET /api/orders/myorders — get logged-in user's orders
  if (req.method === 'GET' && segment1 === 'myorders') {
    try {
      const orders = await Order.find({ user: user.id }).populate('orderItems.product', 'name image price mountain scale').sort({ createdAt: -1 })
      return res.json(orders)
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message })
    }
  }

  // GET /api/orders/:id — get single order
  if (req.method === 'GET' && segment1 && segment1 !== 'myorders') {
    try {
      const order = await Order.findById(segment1).populate('user', 'name email').populate('orderItems.product', 'name image price mountain scale')
      if (!order) return res.status(404).json({ message: 'Order not found' })
      return res.json(order)
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message })
    }
  }

  // PATCH /api/orders/:id/pay — mark order as paid
  if (req.method === 'PATCH' && segment1 && segment2 === 'pay') {
    try {
      const order = await Order.findById(segment1)
      if (!order) return res.status(404).json({ message: 'Order not found' })
      order.isPaid = true
      order.paidAt = Date.now()
      order.status = 'Processing'
      const updated = await order.save()
      return res.json(updated)
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message })
    }
  }

  // PATCH /api/orders/:id/cancel — cancel order
  if (req.method === 'PATCH' && segment1 && segment2 === 'cancel') {
    try {
      const order = await Order.findById(segment1)
      if (!order) return res.status(404).json({ message: 'Order not found' })
      if (order.status === 'Shipped' || order.status === 'Delivered') {
        return res.status(400).json({ message: 'Cannot cancel shipped or delivered order' })
      }
      order.status = 'Cancelled'
      const updated = await order.save()
      return res.json(updated)
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
