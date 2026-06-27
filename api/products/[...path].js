const connectDB = require('../_lib/db')
const Product = require('../_lib/models/product')
const { getUserFromToken } = require('../_lib/auth')

module.exports = async function handler(req, res) {
  await connectDB()

  // Extract sub-path: /api/products or /api/products/someId
  const url = new URL(req.url, `http://${req.headers.host}`)
  const parts = url.pathname.split('/').filter(Boolean) // ['api', 'products', optionalId]
  const productId = parts[2] || null

  // GET /api/products — list with filters
  if (req.method === 'GET' && !productId) {
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

  // GET /api/products/:id — single product
  if (req.method === 'GET' && productId) {
    try {
      const product = await Product.findById(productId)
      if (!product) return res.status(404).json({ message: 'Product not found' })
      return res.json(product)
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

  // PUT /api/products/:id — update product (protected)
  if (req.method === 'PUT' && productId) {
    const user = getUserFromToken(req)
    if (!user) return res.status(401).json({ message: 'No token, access denied' })
    try {
      const product = await Product.findByIdAndUpdate(productId, { ...req.body }, { new: true })
      if (!product) return res.status(404).json({ message: 'Product not found' })
      return res.json(product)
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message })
    }
  }

  // DELETE /api/products/:id — delete product (protected)
  if (req.method === 'DELETE' && productId) {
    const user = getUserFromToken(req)
    if (!user) return res.status(401).json({ message: 'No token, access denied' })
    try {
      const product = await Product.findByIdAndDelete(productId)
      if (!product) return res.status(404).json({ message: 'Product not found' })
      return res.json({ message: 'Product deleted successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
