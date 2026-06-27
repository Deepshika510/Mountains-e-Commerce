import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
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
        <Link to="/cart" className="hover:text-orange-400 transition">Cart</Link>
      </div>
      <button onClick={handleLogout} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm transition">
        Logout
      </button>
    </nav>
  )
}

const Checkout = () => {
  const navigate = useNavigate()
  const cart = JSON.parse(localStorage.getItem('cart') || '[]')

  const [step, setStep] = useState(1) // 1 = address, 2 = review, 3 = success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  const SHIPPING = 99
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal + SHIPPING

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validateStep1 = () => {
    const { fullName, phone, address, city, state, pincode } = form
    if (!fullName || !phone || !address || !city || !state || !pincode) {
      setError('Please fill in all fields')
      return false
    }
    if (phone.length !== 10 || isNaN(phone)) {
      setError('Enter a valid 10-digit phone number')
      return false
    }
    if (pincode.length !== 6 || isNaN(pincode)) {
      setError('Enter a valid 6-digit pincode')
      return false
    }
    setError('')
    return true
  }

  const placeOrder = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      const orderItems = cart.map(item => ({
        product: item._id,
        name: item.name,
        mountain: item.mountain,
        scale: item.scale,
        material: item.material,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderItems,
          shippingAddress: form,
          totalPrice: total,
          shippingPrice: SHIPPING
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message)
        return
      }

      // Clear cart after successful order
      localStorage.removeItem('cart')
      setOrderId(data._id)
      setStep(3)

    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Redirect if cart is empty
  if (cart.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty!</h2>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Shop Now →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Step Indicator */}
        {step !== 3 && (
          <div className="flex items-center justify-center mb-10">
            {['Shipping Address', 'Review Order', 'Order Placed'].map((label, i) => {
              const stepNum = i + 1
              const isCompleted = step > stepNum
              const isCurrent = step === stepNum
              return (
                <div key={label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition
                      ${isCompleted ? 'bg-green-500 text-white'
                        : isCurrent ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-400'}`}>
                      {isCompleted ? '✓' : stepNum}
                    </div>
                    <p className={`text-xs mt-1 font-medium whitespace-nowrap
                      ${isCurrent ? 'text-orange-500' : isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                      {label}
                    </p>
                  </div>
                  {i < 2 && (
                    <div className={`w-24 h-1 mx-2 mb-4 rounded
                      ${step > stepNum ? 'bg-green-500' : 'bg-gray-200'}`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* STEP 1 - Shipping Address */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">📍 Shipping Address</h2>

                {error && (
                  <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House no, Street, Area"
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                    >
                      <option value="">Select State</option>
                      {['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana',
                        'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
                        'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha',
                        'Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
                        'Uttar Pradesh','Uttarakhand','West Bengal'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="560001"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (validateStep1()) setStep(2)
                  }}
                  className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-lg transition hover:scale-105 active:scale-95"
                >
                  Continue to Review →
                </button>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <OrderSummary cart={cart} subtotal={subtotal} total={total} />
          </div>
        )}

        {/* STEP 2 - Review Order */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">

              {/* Address Review */}
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">📍 Delivery Address</h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-orange-500 text-sm font-semibold hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
                  <p className="font-bold text-gray-800">{form.fullName}</p>
                  <p>{form.address}</p>
                  <p>{form.city}, {form.state} - {form.pincode}</p>
                  <p>📞 {form.phone}</p>
                </div>
              </div>

              {/* Items Review */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">🛒 Order Items</h2>
                <div className="space-y-3">
                  {cart.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=MT' }}
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                        <p className="text-gray-500 text-xs">{item.mountain} · {item.scale} · {item.material}</p>
                        <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">💳 Payment Method</h2>
                <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Cash on Delivery</p>
                    <p className="text-gray-500 text-xs">Pay when your order arrives</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition hover:scale-105 active:scale-95 shadow-md"
              >
                {loading ? '⏳ Placing Order...' : '✅ Place Order'}
              </button>
            </div>

            <OrderSummary cart={cart} subtotal={subtotal} total={total} />
          </div>
        )}

        {/* STEP 3 - Success */}
        {step === 3 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-xl max-w-md mx-auto p-10">
              <div className="text-7xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Order Placed!</h2>
              <p className="text-gray-500 mb-4">Your mountain model is on its way!</p>

              <div className="bg-orange-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-bold text-orange-500 text-lg">#{orderId.slice(-8).toUpperCase()}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6 text-left bg-gray-50 rounded-xl p-4">
                <p>📍 Delivering to: <span className="font-semibold">{form.fullName}</span></p>
                <p>🏙️ {form.city}, {form.state}</p>
                <p>🚚 Estimated delivery: 5-7 business days</p>
                <p>💳 Payment: Cash on Delivery</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition"
                >
                  View Orders
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="flex-1 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 py-3 rounded-xl font-bold transition"
                >
                  Shop More
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Reusable Order Summary component
const OrderSummary = ({ cart, subtotal, total }) => (
  <div className="lg:col-span-1">
    <div className="bg-white rounded-2xl shadow p-5 sticky top-6">
      <h3 className="font-bold text-gray-800 text-lg mb-4">Order Summary</h3>
      <div className="space-y-3 mb-4">
        {cart.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 object-cover rounded-lg"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=MT' }}
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
              <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>₹99</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
          <span>Total</span>
          <span className="text-orange-500 text-lg">₹{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  </div>
)

export default Checkout