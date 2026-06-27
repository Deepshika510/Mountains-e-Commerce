import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const regions = ["All", "Himalayas", "Africa", "Alps", "Andes", "Rockies", "Antarctica"]
const materials = ["All", "Resin", "Wood", "Metal", "Plastic", "Stone Powder"]
const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
]

const ITEMS_PER_PAGE = 6

const StockBadge = ({ stock }) => {
  if (stock === 0) return (
    <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">Out of Stock</span>
  )
  if (stock <= 5) return (
    <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-1 rounded-full animate-pulse">Only {stock} left!</span>
  )
  if (stock <= 15) return (
    <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">Limited ({stock})</span>
  )
  return (
    <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">In Stock ({stock})</span>
  )
}

const Navbar = ({ cartCount }) => {
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-2xl">⛰️</span>
        <span className="text-xl font-bold text-orange-400">MountainToys</span>
      </div>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/dashboard" className="hover:text-orange-400 transition">Home</Link>
        <Link to="/products" className="text-orange-400 border-b border-orange-400">Products</Link>
        <Link to="/orders" className="hover:text-orange-400 transition">My Orders</Link>
        <Link to="/profile" className="hover:text-orange-400 transition">Profile</Link>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/cart" className="relative">
          <span className="text-2xl">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
        <button onClick={handleLogout} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm transition">
          Logout
        </button>
      </div>
    </nav>
  )
}

const Products = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("All")
  const [selectedMaterial, setSelectedMaterial] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState("grid")
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]')
    } catch { return [] }
  })
  const [addedId, setAddedId] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (selectedRegion !== 'All') params.append('region', selectedRegion)
        if (selectedMaterial !== 'All') params.append('material', selectedMaterial)
        if (search) params.append('search', search)

        const res = await fetch(`/api/products?${params}`)
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
        setCurrentPage(1)
      } catch (err) {
        console.error('Failed to fetch products:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    const delay = setTimeout(fetchProducts, 400)
    return () => clearTimeout(delay)
  }, [search, selectedRegion, selectedMaterial])

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price
    if (sortBy === 'price_desc') return b.price - a.price
    if (sortBy === 'rating') return b.rating - a.rating
    return 0
  })

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paginated = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const addToCart = (e, product) => {
    e.stopPropagation() // prevent navigating to detail page
    if (product.stock === 0) return

    const existing = cart.find(item => item._id === product._id)
    let updatedCart

    if (existing) {
      updatedCart = cart.map(item =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      )
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }]
    }

    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    setAddedId(product._id)
    setTimeout(() => setAddedId(null), 1500)
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar cartCount={cartCount} />

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-orange-900 text-white py-10 px-6 text-center">
        <h1 className="text-3xl font-extrabold mb-1">🏔️ All Mountain Models</h1>
        <p className="text-orange-300">{products.length} models available</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Search + Sort + View toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="🔍 Search mountains..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-5 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition
                ${viewMode === 'grid' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300'}`}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition
                ${viewMode === 'list' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300'}`}
            >
              ☰ List
            </button>
          </div>
        </div>

        {/* Region Filter */}
        <div className="flex gap-2 flex-wrap items-center mb-3">
          <span className="text-sm font-semibold text-gray-500">Region:</span>
          {regions.map(r => (
            <button key={r} onClick={() => { setSelectedRegion(r); setCurrentPage(1) }}
              className={`px-3 py-1 rounded-full text-sm border transition
                ${selectedRegion === r ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'}`}>
              {r}
            </button>
          ))}
        </div>

        {/* Material Filter */}
        <div className="flex gap-2 flex-wrap items-center mb-8">
          <span className="text-sm font-semibold text-gray-500">Material:</span>
          {materials.map(m => (
            <button key={m} onClick={() => { setSelectedMaterial(m); setCurrentPage(1) }}
              className={`px-3 py-1 rounded-full text-sm border transition
                ${selectedMaterial === m ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'}`}>
              {m}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow animate-pulse">
                <div className="h-64 bg-gray-200 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>

        ) : paginated.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-5xl mb-4">⛰️</p>
            <p className="text-gray-500 text-lg">No mountain models found.</p>
          </div>

        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/products/${product._id}`)}
                className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image' }}
                  />
                  {product.isFeatured && (
                    <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                      ⭐ Featured
                    </span>
                  )}
                  <div className="absolute top-3 right-3">
                    <StockBadge stock={product.stock} />
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-gray-800 font-bold text-lg leading-tight mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">📍 {product.region}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">🔬 {product.scale}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">🪨 {product.material}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">📏 {product.height_of_mountain_m}m</span>
                  </div>

                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                    ))}
                    <span className="text-sm text-gray-500 ml-1">{product.rating}</span>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                    <button
                      onClick={(e) => addToCart(e, product)}
                      disabled={product.stock === 0}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                        ${addedId === product._id
                          ? 'bg-green-500 text-white scale-95'
                          : product.stock === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 active:scale-95'}`}
                    >
                      {addedId === product._id ? '✓ Added!' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : (
          // LIST VIEW
          <div className="flex flex-col gap-4">
            {paginated.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/products/${product._id}`)}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300 flex overflow-hidden cursor-pointer"
              >
                <div className="w-48 h-40 flex-shrink-0 overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image' }}
                  />
                </div>

                <div className="p-5 flex flex-1 items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-gray-800 font-bold text-lg">{product.name}</h3>
                      {product.isFeatured && (
                        <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>
                      )}
                      <StockBadge stock={product.stock} />
                    </div>
                    <p className="text-gray-500 text-sm mb-2 line-clamp-1">{product.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">📍 {product.region}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-full">🔬 {product.scale}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-full">🪨 {product.material}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-full">📏 {product.height_of_mountain_m}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                      ))}
                      <span className="text-sm text-gray-500 ml-1">{product.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                    <button
                      onClick={(e) => addToCart(e, product)}
                      disabled={product.stock === 0}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                        ${addedId === product._id
                          ? 'bg-green-500 text-white scale-95'
                          : product.stock === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 active:scale-95'}`}
                    >
                      {addedId === product._id ? '✓ Added!' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border bg-white text-gray-600 hover:border-orange-400 disabled:opacity-40 transition"
            >
              ← Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl border text-sm font-semibold transition
                  ${currentPage === i + 1
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl border bg-white text-gray-600 hover:border-orange-400 disabled:opacity-40 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products