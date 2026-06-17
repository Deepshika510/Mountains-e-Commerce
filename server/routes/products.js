const express = require('express')
const Product = require('../models/product')
const protect = require('../middleware/authmiddleware')

const router = express.Router()

// GET all products with filters
router.get('/', async (req, res) => {
  try {
    const { region, material, search } = req.query

    let filter = {}

    if (region && region !== 'All') filter.region = region
    if (material && material !== 'All') filter.material = material
    if (search) filter.name = { $regex: search, $options: 'i' }

    const products = await Product.find(filter).sort({ createdAt: -1 })
    res.json(products)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// POST create product (protected)
router.post('/', protect, async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// PUT update product (protected)
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    )
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// DELETE product (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

module.exports = router