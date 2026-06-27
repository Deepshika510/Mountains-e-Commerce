import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const Navbar = ({ cartCount }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md text-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">⛰️</span>
        <span className="text-xl font-bold text-orange-400">MountainToys</span>
      </div>

      <div className="flex items-center gap-8 text-sm font-medium">
        <Link to="/dashboard" className="text-orange-400 border-b border-orange-400">Home</Link>
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
        <button
          onClick={handleLogout}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm transition"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useState(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        const featured = Array.isArray(data) ? data.filter(p => p.isFeatured) : []
        setProducts(featured)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow animate-pulse h-80" />
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <div
          key={product._id}
          onClick={() => navigate('/products')}
          className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
        >
          <div className="h-56 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image' }}
            />
          </div>
          <div className="p-5">
            <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xl font-bold text-orange-500">₹{product.price.toLocaleString()}</span>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-semibold">⭐ Featured</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const Dashboard = () => {
  const navigate = useNavigate()
  const cart = JSON.parse(localStorage.getItem('cart') || '[]')
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar cartCount={cartCount} />

      {/* HERO VIDEO SECTION */}
      <div className="relative w-full h-screen overflow-hidden">

        {/* YouTube looping autoplay muted */}
        <iframe
          className="absolute top-1/2 left-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full -translate-x-1/2 -translate-y-1/2"
          src="https://www.youtube.com/embed/RFmQSO2fO30?autoplay=1&mute=1&loop=1&playlist=RFmQSO2fO30&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&start=3"
          title="Mountain Background"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <p className="text-orange-400 font-semibold text-lg tracking-widest uppercase mb-4">
            Welcome to MountainToys
          </p>

          <h1 className="text-6xl md:text-8xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            Mountains Are <br />
            <span className="text-orange-400">Great</span>
          </h1>

          <p className="text-gray-300 text-xl max-w-xl mb-10">
            Own a piece of the world's greatest peaks. Handcrafted miniature mountain models for collectors and adventurers.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/products')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            >
              Shop Now 🛒
            </button>
            <button
              onClick={() => document.getElementById('featured').scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-200 hover:scale-105"
            >
              View Featured ↓
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white text-sm flex flex-col items-center gap-1">
          <span>Scroll</span>
          <span>↓</span>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="bg-gray-900 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "7+", label: "Mountain Models" },
            { value: "100%", label: "Handcrafted" },
            { value: "5★", label: "Rated" },
            { value: "Fast", label: "Shipping" },
          ].map((stat, i) => (
            <div key={i} className="text-white">
              <p className="text-4xl font-extrabold text-orange-400">{stat.value}</p>
              <p className="text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED PRODUCTS SECTION */}
      <div id="featured" className="bg-gray-100 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-gray-800">Featured Models</h2>
            <p className="text-gray-500 mt-2">Our most loved mountain replicas</p>
          </div>

          <FeaturedProducts />

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/products')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              View All Products →
            </button>
          </div>
        </div>
      </div>

      {/* WHY US SECTION */}
      <div className="bg-gray-900 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-12">Why Choose MountainToys?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🏔️", title: "Authentic Replicas", desc: "Each model is crafted to accurately represent the real mountain's terrain and features." },
              { icon: "🎁", title: "Perfect Gift", desc: "A unique and memorable gift for hikers, travelers, and mountain lovers." },
              { icon: "🚚", title: "Safe Delivery", desc: "Every model is carefully packed and delivered safely to your doorstep." },
            ].map((item, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-8 text-center hover:bg-gray-700 transition">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 py-8 text-center text-sm">
        <p className="text-orange-400 font-bold text-lg mb-2">⛰️ MountainToys</p>
        <p>© 2024 MountainToys. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link to="/products" className="hover:text-orange-400 transition">Products</Link>
          <Link to="/orders" className="hover:text-orange-400 transition">My Orders</Link>
          <Link to="/cart" className="hover:text-orange-400 transition">Cart</Link>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard