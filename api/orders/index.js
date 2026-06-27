const connectDB = require('../_lib/db')
const Order = require('../_lib/models/order')
const { getUserFromToken } = require('../_lib/auth')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  await connectDB()
  const user = getUserFromToken(req)
  if (!user) return res.status(401).json({ message: 'No token, access denied' })
  try {
    const { orderItems, shippingAddress, totalPrice, shippingPrice } = req.body
    if (!orderItems || orderItems.length === 0) return res.status(400).json({ message: 'No items in order' })
    const order = await Order.create({ user: user.id, orderItems, shippingAddress, totalPrice, shippingPrice })
    return res.status(201).json(order)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}
