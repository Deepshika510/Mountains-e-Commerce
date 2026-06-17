import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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

const Cart = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]')
    } catch { return [] }
  })
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMsg, setCouponMsg] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  const VALID_COUPONS = {
    'MOUNTAIN10': 10,
    'PEAK20': 20,
    'SUMMIT15': 15,
  }

  const SHIPPING = 99

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return
    setCart(cart.map(item =>
      item._id === id ? { ...item, quantity: newQty } : item
    ))
  }

  const removeItem = (id) => {
    setCart(cart.filter(item => item._id !== id))
  }

  const clearCart = () => {
    setCart([])
    setDiscount(0)
    setCouponApplied(false)
    setCoupon('')
    setCouponMsg('')
  }

  const applyCoupon = () => {
    if (couponApplied) {
      setCouponMsg('Coupon already applied!')
      return
    }
    const code = coupon.trim().toUpperCase()
    if (VALID_COUPONS[code]) {
      setDiscount(VALID_COUPONS[code])
      setCouponApplied(true)
      setCouponMsg(`✅ Coupon applied! ${VALID_COUPONS[code]}% off`)
    } else {
      setCouponMsg('❌ Invalid coupon code')
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = Math.round((subtotal * discount) / 100)
  const total = subtotal - discountAmount + SHIPPING
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar cartCount={cartCount} />

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Shopping Cart</h1>
            <p className="text-gray-500 mt-1">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 text-sm font-semibold transition"
            >
              🗑️ Clear Cart
            </button>
          )}
        </div>

        {/* Empty Cart */}
        {cart.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-7xl mb-4">🛒</p>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty!</h2>
            <p className="text-gray-500 mb-8">Add some mountain models to get started.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition hover:scale-105"
            >
              Browse Products →
            </button>
          </div>

        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow hover:shadow-md transition p-4 flex gap-4"
                >
                  {/* Image */}
                  <div
                    onClick={() => navigate(`/products/${item._id}`)}
                    className="w-28 h-28 flex-shrink-0 overflow-hidden rounded-xl cursor-pointer bg-gray-100"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/112?text=MT' }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3
                          onClick={() => navigate(`/products/${item._id}`)}
                          className="font-bold text-gray-800 hover:text-orange-500 cursor-pointer transition"
                        >
                          {item.name}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1">
                          {item.region} · {item.scale} · {item.material}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-gray-300 hover:text-red-500 transition text-xl ml-2"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-3 py-1.5 hover:bg-gray-100 text-gray-600 font-bold transition"
                        >
                          −
                        </button>
                        <span className="px-4 py-1.5 font-bold text-gray-800 border-x border-gray-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="px-3 py-1.5 hover:bg-gray-100 text-gray-600 font-bold transition disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">₹{item.price.toLocaleString()} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue Shopping */}
              <button
                onClick={() => navigate('/products')}
                className="text-orange-500 hover:text-orange-600 text-sm font-semibold transition flex items-center gap-1 mt-2"
              >
                ← Continue Shopping
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800 mb-5">Order Summary</h2>

                {/* Price Breakdown */}
                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartCount} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%)</span>
                      <span>− ₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>₹{SHIPPING}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-3">
                    <span>Total</span>
                    <span className="text-orange-500 text-xl">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-700 mb-2">🎟️ Coupon Code</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Enter code"
                      disabled={couponApplied}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponApplied}
                      className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMsg && (
                    <p className={`text-xs mt-2 font-medium ${couponApplied ? 'text-green-600' : 'text-red-500'}`}>
                      {couponMsg}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Try: MOUNTAIN10, PEAK20, SUMMIT15</p>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-lg transition hover:scale-105 active:scale-95 shadow-md"
                >
                  Proceed to Checkout →
                </button>

                {/* Security note */}
                <p className="text-center text-xs text-gray-400 mt-3">
                  🔒 Secure checkout · Free returns
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart