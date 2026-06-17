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
        <Link to="/orders" className="text-orange-400 border-b border-orange-400">My Orders</Link>
        <Link to="/profile" className="hover:text-orange-400 transition">Profile</Link>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/cart" className="relative">
          <span className="text-2xl">🛒</span>
        </Link>
        <button onClick={handleLogout} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm transition">
          Logout
        </button>
      </div>
    </nav>
  )
}

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Processing: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-purple-100 text-purple-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  }
  const icons = {
    Pending: '🕐',
    Processing: '⚙️',
    Shipped: '🚚',
    Delivered: '✅',
    Cancelled: '❌',
  }

  return (
    <span className={`${styles[status]} text-xs font-semibold px-3 py-1 rounded-full`}>
      {icons[status]} {status}
    </span>
  )
}

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:5000/api/orders/myorders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.message)
          return
        }

        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        setError('Failed to fetch orders. Is the server running?')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.message)
        return
      }

      // Update order status locally
      setOrders(orders.map(o =>
        o._id === orderId ? { ...o, status: 'Cancelled' } : o
      ))
    } catch (err) {
      alert('Failed to cancel order')
    }
  }

  const cart = JSON.parse(localStorage.getItem('cart') || '[]')
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar cartCount={cartCount} />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow animate-pulse h-32" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar cartCount={cartCount} />

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">My Orders</h1>
          <p className="text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📦</p>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No orders yet!</h2>
            <p className="text-gray-500 mb-6">You haven't placed any orders. Start exploring our mountain models!</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition"
            >
              Shop Now →
            </button>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden">

              {/* Order Header */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800 text-sm">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <StatusBadge status={order.status} />
                    {order.isPaid && (
                      <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">
                        💳 Paid
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-orange-500">
                    ₹{order.totalPrice.toLocaleString()}
                  </span>
                  <span className="text-gray-400 text-lg">
                    {expandedOrder === order._id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expanded Order Details */}
              {expandedOrder === order._id && (
                <div className="border-t border-gray-100 px-5 pb-5">

                  {/* Order Items */}
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Items Ordered:</p>
                    {order.orderItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=MT' }}
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                          <p className="text-gray-500 text-xs">{item.mountain} · {item.scale} · {item.material}</p>
                          <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="mt-4 bg-orange-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{(order.totalPrice - (order.shippingPrice || 99)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>₹{order.shippingPrice || 99}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-800 border-t border-orange-200 pt-2">
                      <span>Total</span>
                      <span className="text-orange-500">₹{order.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm">
                      <p className="font-semibold text-gray-700 mb-1">📍 Shipping Address</p>
                      <p className="text-gray-500">{order.shippingAddress.fullName}</p>
                      <p className="text-gray-500">{order.shippingAddress.address}</p>
                      <p className="text-gray-500">
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </p>
                      <p className="text-gray-500">📞 {order.shippingAddress.phone}</p>
                    </div>
                  )}

                  {/* Order Timeline */}
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-600 mb-3">Order Timeline:</p>
                    <div className="flex items-center gap-0">
                      {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, i, arr) => {
                        const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered']
                        const currentIndex = statusOrder.indexOf(order.status)
                        const stepIndex = statusOrder.indexOf(step)
                        const isCompleted = stepIndex <= currentIndex && order.status !== 'Cancelled'
                        const isCancelled = order.status === 'Cancelled'

                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                ${isCancelled ? 'bg-red-100 text-red-500'
                                  : isCompleted ? 'bg-orange-500 text-white'
                                  : 'bg-gray-200 text-gray-400'}`}>
                                {isCancelled ? '✕' : isCompleted ? '✓' : i + 1}
                              </div>
                              <p className={`text-xs mt-1 font-medium
                                ${isCancelled ? 'text-red-400'
                                  : isCompleted ? 'text-orange-500'
                                  : 'text-gray-400'}`}>
                                {step}
                              </p>
                            </div>
                            {i < arr.length - 1 && (
                              <div className={`flex-1 h-1 mx-1 rounded
                                ${isCompleted && stepIndex < currentIndex ? 'bg-orange-500' : 'bg-gray-200'}`}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-3">
                    {(order.status === 'Pending' || order.status === 'Processing') && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        className="px-4 py-2 rounded-xl border-2 border-red-400 text-red-500 hover:bg-red-50 text-sm font-semibold transition"
                      >
                        Cancel Order
                      </button>
                    )}
                    <button
                      onClick={() => navigate('/products')}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition"
                    >
                      Shop Again →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Orders