import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// ─── DB CONNECTION (cached for serverless) ───
let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI).then((m) => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}

// ─── AUTH HELPER ───
function getUserFromToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.split(' ')[1]
  try { return jwt.verify(token, process.env.JWT_SECRET) }
  catch (e) { return null }
}

// ─── MODELS ───
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true })
const User = mongoose.models.User || mongoose.model('User', userSchema)

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  mountain: { type: String, required: true },
  region: { type: String, required: true, enum: ['Himalayas', 'Andes', 'Alps', 'Rockies', 'Africa', 'Antarctica'] },
  scale: { type: String, required: true },
  height_of_mountain_m: { type: Number },
  material: { type: String, enum: ['Resin', 'Wood', 'Metal', 'Plastic', 'Stone Powder'], required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  image: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true })
const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String, mountain: String, scale: String, material: String, price: Number,
  quantity: { type: Number, required: true, default: 1 },
  image: String
})
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  shippingAddress: { fullName: String, address: String, city: String, pincode: String, state: String, phone: String },
  totalPrice: { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, default: 99 },
  isPaid: { type: Boolean, default: false },
  isDelivered: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  paidAt: Date, deliveredAt: Date
}, { timestamps: true })
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

// ─── HANDLER ───
export default async function handler(req, res) {
  try {
    await connectDB()
  } catch (dbErr) {
    return res.status(500).json({ message: 'DB connection failed', error: dbErr.message })
  }

  // Route comes from rewrite query param: /api/auth/register -> ?route=auth/register
  const routePath = req.query.route || ''
  const pathParts = routePath.split('/').filter(Boolean)
  const resource = pathParts[0]
  const action = pathParts[1] || null
  const subAction = pathParts[2] || null

  // ─── AUTH ───
  if (resource === 'auth') {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

    if (action === 'register') {
      try {
        const { name, email, password } = req.body
        const existingUser = await User.findOne({ email })
        if (existingUser) return res.status(400).json({ message: 'Email already registered' })
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, password: hashedPassword })
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
        return res.status(201).json({ token, message: 'Registered successfully' })
      } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
      }
    }

    if (action === 'login') {
      try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'Invalid email or password' })
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' })
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
        return res.json({ token, message: 'Login successful' })
      } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
      }
    }
    return res.status(404).json({ message: 'Not found' })
  }

  // ─── PRODUCTS ───
  if (resource === 'products') {
    if (req.method === 'GET' && !action) {
      try {
        const { region, material, search } = req.query
        let filter = {}
        if (region && region !== 'All') filter.region = region
        if (material && material !== 'All') filter.material = material
        if (search) filter.name = { $regex: search, $options: 'i' }
        const products = await Product.find(filter).sort({ createdAt: -1 })
        return res.json(products)
      } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
      }
    }
    if (req.method === 'GET' && action) {
      try {
        const product = await Product.findById(action)
        if (!product) return res.status(404).json({ message: 'Product not found' })
        return res.json(product)
      } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
      }
    }
    if (req.method === 'POST') {
      const user = getUserFromToken(req)
      if (!user) return res.status(401).json({ message: 'No token, access denied' })
      try {
        const product = await Product.create(req.body)
        return res.status(201).json(product)
      } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
      }
    }
    if (req.method === 'PUT' && action) {
      const user = getUserFromToken(req)
      if (!user) return res.status(401).json({ message: 'No token, access denied' })
      try {
        const product = await Product.findByIdAndUpdate(action, { ...req.body }, { new: true })
        if (!product) return res.status(404).json({ message: 'Product not found' })
        return res.json(product)
      } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
      }
    }
    if (req.method === 'DELETE' && action) {
      const user = getUserFromToken(req)
      if (!user) return res.status(401).json({ message: 'No token, access denied' })
      try {
        const product = await Product.findByIdAndDelete(action)
        if (!product) return res.status(404).json({ message: 'Product not found' })
        return res.json({ message: 'Product deleted successfully' })
      } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
      }
    }
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // ─── ORDERS ───
  if (resource === 'orders') {
    const user = getUserFromToken(req)
    if (!user) return res.status(401).json({ message: 'No token, access denied' })

    if (req.method === 'POST' && !action) {
      try {
        const { orderItems, shippingAddress, totalPrice, shippingPrice } = req.body
        if (!orderItems || orderItems.length === 0) return res.status(400).json({ message: 'No items in order' })
        const order = await Order.create({ user: user.id, orderItems, shippingAddress, totalPrice, shippingPrice })
        return res.status(201).json(order)
      } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
      }
    }
    if (req.method === 'GET' && action === 'myorders') {
      try {
        const orders = await Order.find({ user: user.id }).populate('orderItems.product', 'name image price mountain scale').sort({ createdAt: -1 })
        return res.json(orders)
      } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
      }
    }
    if (req.method === 'GET' && action && action !== 'myorders') {
      try {
        const order = await Order.findById(action).populate('user', 'name email').populate('orderItems.product', 'name image price mountain scale')
        if (!order) return res.status(404).json({ message: 'Order not found' })
        return res.json(order)
      } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
      }
    }
    if (req.method === 'PATCH' && action && subAction === 'pay') {
      try {
        const order = await Order.findById(action)
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
    if (req.method === 'PATCH' && action && subAction === 'cancel') {
      try {
        const order = await Order.findById(action)
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

  return res.status(404).json({ message: 'Route not found' })
}
