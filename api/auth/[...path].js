const connectDB = require('../_lib/db')
const User = require('../_lib/models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = async function handler(req, res) {
  await connectDB()

  // Extract the sub-path: /api/auth/login or /api/auth/register
  const url = new URL(req.url, `http://${req.headers.host}`)
  const parts = url.pathname.split('/').filter(Boolean) // ['api', 'auth', 'login']
  const action = parts[2] // 'login' or 'register'

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

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
