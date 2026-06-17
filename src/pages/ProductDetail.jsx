import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

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
        <Link to="/products" className="hover:text-orange-400 transition">Products</Link>
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

const StockBadge = ({ stock }) => {
  if (stock === 0) return <span className="bg-red-100 text-red-600 text-sm font-semibold px-3 py-1 rounded-full">Out of Stock</span>
  if (stock <= 5) return <span className="bg-orange-100 text-orange-600 text-sm font-semibold px-3 py-1 rounded-full animate-pulse">Only {stock} left!</span>
  if (stock <= 15) return <span className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">Limited Stock ({stock})</span>
  return <span className="bg-green-100 text-green-600 text-sm font-semibold px-3 py-1 rounded-full">In Stock ({stock})</span>
}

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviews, setReviews] = useState([
    { name: "Arjun M.", rating: 5, comment: "Absolutely stunning model! The detail is incredible.", date: "2024-05-10" },
    { name: "Priya K.", rating: 4, comment: "Great quality, looks amazing on my desk!", date: "2024-04-22" },
    { name: "Rahul S.", rating: 5, comment: "Perfect gift for mountain lovers. Very well made.", date: "2024-03-15" },
  ])

  const cart = JSON.parse(localStorage.getItem('cart') || '[]')
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:5000/api/products/${id}`)
        const data = await res.json()
        setProduct(data)

        // Fetch related products (same region)
        const allRes = await fetch(`http://localhost:5000/api/products?region=${data.region}`)
        const allData = await allRes.json()
        const filtered = Array.isArray(allData)
          ? allData.filter(p => p._id !== id).slice(0, 3)
          : []
        setRelated(filtered)

      } catch (err) {
        console.error('Failed to fetch product:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
    window.scrollTo(0, 0)
  }, [id])

  const addToCart = () => {
    if (!product || product.stock === 0) return

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = existingCart.find(item => item._id === product._id)
    let updatedCart

    if (existing) {
      updatedCart = existingCart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    } else {
      updatedCart = [...existingCart, { ...product, quantity }]
    }

    localStorage.setItem('cart', JSON.stringify(updatedCart))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const submitReview = () => {
    if (!reviewText.trim()) return
    const newReview = {
      name: "You",
      rating: reviewRating,
      comment: reviewText,
      date: new Date().toISOString().split('T')[0]
    }
    setReviews([newReview, ...reviews])
    setReviewText('')
    setReviewRating(5)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar cartCount={cartCount} />
      <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">⛰️</p>
        <p className="text-gray-500 text-lg">Product not found.</p>
        <button onClick={() => navigate('/products')} className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-xl">
          Back to Products
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar cartCount={cartCount} />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-gray-500 flex gap-2 items-center">
        <Link to="/dashboard" className="hover:text-orange-500">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-orange-500">Products</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{product.name}</span>
      </div>

      {/* Main Product Section */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* Image Section */}
            <div className="relative bg-gray-50 flex items-center justify-center p-8">
              {/* Zoom overlay */}
              {zoomed && (
                <div
                  className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-zoom-out"
                  onClick={() => setZoomed(false)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-w-3xl max-h-screen object-contain rounded-2xl"
                  />
                  <button className="absolute top-6 right-6 text-white text-3xl">✕</button>
                </div>
              )}

              <img
                src={product.image}
                alt={product.name}
                onClick={() => setZoomed(true)}
                className="w-full h-96 object-cover rounded-xl cursor-zoom-in hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image' }}
              />

              {/* Featured badge */}
              {product.isFeatured && (
                <span className="absolute top-6 left-6 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  ⭐ Featured
                </span>
              )}

              {/* Zoom hint */}
              <p className="absolute bottom-4 right-4 text-xs text-gray-400">🔍 Click to zoom</p>
            </div>

            {/* Info Section */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                {/* Name + Stock */}
                <div className="flex items-start justify-between mb-3 gap-3">
                  <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
                  <StockBadge stock={product.stock} />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(product.rating) ? "text-yellow-400 text-xl" : "text-gray-300 text-xl"}>★</span>
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">{product.rating} · {reviews.length} reviews</span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-orange-500">₹{product.price.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm ml-2">+ ₹99 shipping</span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "Mountain", value: product.mountain },
                    { label: "Region", value: product.region },
                    { label: "Scale", value: product.scale },
                    { label: "Material", value: product.material },
                    { label: "Real Height", value: `${product.height_of_mountain_m}m` },
                    { label: "Stock", value: `${product.stock} units` },
                  ].map((spec, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-400 font-medium">{spec.label}</p>
                      <p className="text-gray-800 font-semibold text-sm">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity + Add to Cart */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-gray-600 font-medium">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition font-bold text-lg"
                    >
                      −
                    </button>
                    <span className="px-5 py-2 font-bold text-gray-800 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all duration-200
                      ${added
                        ? 'bg-green-500 text-white scale-95'
                        : product.stock === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 active:scale-95'}`}
                  >
                    {added ? '✓ Added to Cart!' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
                  </button>

                  <button
                    onClick={() => {
                      addToCart()
                      navigate('/cart')
                    }}
                    disabled={product.stock === 0}
                    className="px-6 py-3 rounded-xl font-bold border-2 border-orange-500 text-orange-500 hover:bg-orange-50 transition disabled:opacity-40"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-lg mt-6 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            {['description', 'specs', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold capitalize transition
                  ${activeTab === tab
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-500 hover:text-gray-800'}`}
              >
                {tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">About this Model</h3>
                <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>
                <div className="mt-6 bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-orange-700 font-semibold text-sm">🏔️ Did you know?</p>
                  <p className="text-orange-600 text-sm mt-1">
                    {product.mountain} stands at {product.height_of_mountain_m} meters above sea level,
                    located in the {product.region} region. This model replicates it at a scale of {product.scale}.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Product Name", value: product.name },
                    { label: "Mountain", value: product.mountain },
                    { label: "Region", value: product.region },
                    { label: "Scale", value: product.scale },
                    { label: "Material", value: product.material },
                    { label: "Real Mountain Height", value: `${product.height_of_mountain_m} meters` },
                    { label: "Rating", value: `${product.rating} / 5` },
                    { label: "Availability", value: product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock' },
                    { label: "Shipping", value: "₹99 flat rate" },
                    { label: "Delivery", value: "5-7 business days" },
                  ].map((spec, i) => (
                    <div key={i} className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">{spec.label}</span>
                      <span className="text-gray-800 font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Customer Reviews</h3>

                {/* Write review */}
                <div className="bg-gray-50 rounded-xl p-5 mb-6">
                  <p className="font-semibold text-gray-700 mb-3">Write a Review</p>

                  {/* Star selector */}
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl transition ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this mountain model..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none"
                    rows={3}
                  />

                  <button
                    onClick={submitReview}
                    className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl text-sm font-semibold transition"
                  >
                    Submit Review
                  </button>
                </div>

                {/* Reviews list */}
                <div className="space-y-4">
                  {reviews.map((review, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600">
                            {review.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{review.name}</p>
                            <p className="text-gray-400 text-xs">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, j) => (
                            <span key={j} className={j < review.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Related Models from {product.region}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(rel => (
                <div
                  key={rel._id}
                  onClick={() => navigate(`/products/${rel._id}`)}
                  className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image' }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800">{rel.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-orange-500 font-bold text-lg">₹{rel.price.toLocaleString()}</span>
                      <StockBadge stock={rel.stock} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail