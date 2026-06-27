const connectDB = require('../_lib/db')
const Product = require('../_lib/models/product')
const { getUserFromToken } = require('../_lib/auth')

module.exports = async function handler(req, res) {
  await connectDB()

  // GET /api/products — list with filters
  if (req.method === 'GET') {
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

  // POST /api/products — create product (protected)
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

  return res.status(405).json({ message: 'Method not allowed' })
}
