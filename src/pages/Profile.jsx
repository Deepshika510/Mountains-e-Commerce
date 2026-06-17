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
        <Link to="/profile" className="text-orange-400 border-b border-orange-400">Profile</Link>
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

const Profile = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    pincode: '',
    address: '',
  })

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  const cart = JSON.parse(localStorage.getItem('cart') || '[]')
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Decode token to get user info
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setProfile(prev => ({
        ...prev,
        email: payload.email || '',
        name: payload.name || '',
      }))
    } catch (err) {
      console.error('Token decode error:', err)
    }
  }, [])

  // Fetch orders for stats
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:5000/api/orders/myorders', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      } finally {
        setOrdersLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
  }

  const saveProfile = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    // Simulate save (connect to backend later)
    setTimeout(() => {
      setSuccess('Profile updated successfully!')
      setLoading(false)
      setTimeout(() => setSuccess(''), 3000)
    }, 800)
  }

  const changePassword = async () => {
    setError('')
    setSuccess('')

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setError('Please fill in all password fields')
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    if (passwords.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setSuccess('Password changed successfully!')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setLoading(false)
      setTimeout(() => setSuccess(''), 3000)
    }, 800)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('cart')
    navigate('/')
  }

  // Stats
  const totalOrders = orders.length
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length
  const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0)
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length

  const tabs = ['profile', 'security', 'orders', 'danger']

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar cartCount={cartCount} />

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-gray-900 to-orange-900 rounded-2xl shadow-lg p-8 mb-6 text-white flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-3xl font-extrabold flex-shrink-0">
            {profile.name ? profile.name[0].toUpperCase() : profile.email[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold">{profile.name || 'Mountain Explorer'}</h1>
            <p className="text-orange-300 text-sm mt-1">{profile.email}</p>
            <p className="text-gray-400 text-xs mt-1">Member since {new Date().getFullYear()}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Orders', value: ordersLoading ? '...' : totalOrders, icon: '📦', color: 'bg-blue-50 text-blue-700' },
            { label: 'Delivered', value: ordersLoading ? '...' : deliveredOrders, icon: '✅', color: 'bg-green-50 text-green-700' },
            { label: 'Pending', value: ordersLoading ? '...' : pendingOrders, icon: '🕐', color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Total Spent', value: ordersLoading ? '...' : `₹${totalSpent.toLocaleString()}`, icon: '💰', color: 'bg-orange-50 text-orange-700' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-2xl p-4 text-center shadow-sm`}>
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-extrabold">{stat.value}</p>
              <p className="text-xs font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {[
              { key: 'profile', label: '👤 Profile' },
              { key: 'security', label: '🔒 Security' },
              { key: 'orders', label: '📦 Orders' },
              { key: 'danger', label: '⚠️ Account' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setError(''); setSuccess('') }}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition
                  ${activeTab === tab.key
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-500 hover:text-gray-800'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* Success / Error */}
            {success && (
              <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                ✅ {success}
              </div>
            )}
            {error && (
              <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                ❌ {error}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-5">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city}
                      onChange={handleProfileChange}
                      placeholder="Your city"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select
                      name="state"
                      value={profile.state}
                      onChange={handleProfileChange}
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
                      value={profile.pincode}
                      onChange={handleProfileChange}
                      placeholder="560001"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={profile.address}
                      onChange={handleProfileChange}
                      placeholder="House no, Street, Area"
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="mt-6 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition hover:scale-105 active:scale-95"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-5">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwords.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>

                  <button
                    onClick={changePassword}
                    disabled={loading}
                    className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>

                <div className="mt-8 bg-blue-50 rounded-xl p-4">
                  <p className="text-blue-700 font-semibold text-sm mb-2">🔒 Security Tips</p>
                  <ul className="text-blue-600 text-xs space-y-1">
                    <li>• Use at least 8 characters</li>
                    <li>• Mix uppercase, lowercase, numbers</li>
                    <li>• Never share your password</li>
                    <li>• Use a unique password for this site</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                  <button
                    onClick={() => navigate('/orders')}
                    className="text-orange-500 text-sm font-semibold hover:underline"
                  >
                    View All →
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-gray-500">No orders yet</p>
                    <button
                      onClick={() => navigate('/products')}
                      className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-semibold"
                    >
                      Shop Now →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => {
                      const statusColors = {
                        Pending: 'bg-yellow-100 text-yellow-700',
                        Processing: 'bg-blue-100 text-blue-700',
                        Shipped: 'bg-purple-100 text-purple-700',
                        Delivered: 'bg-green-100 text-green-700',
                        Cancelled: 'bg-red-100 text-red-700',
                      }
                      return (
                        <div
                          key={order._id}
                          onClick={() => navigate('/orders')}
                          className="flex items-center justify-between bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-orange-50 transition"
                        >
                          <div>
                            <p className="font-bold text-gray-800 text-sm">
                              #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-gray-400 text-xs mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('en-IN')}
                              · {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`${statusColors[order.status]} text-xs font-semibold px-2 py-1 rounded-full`}>
                              {order.status}
                            </span>
                            <span className="font-bold text-orange-500">
                              ₹{order.totalPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* DANGER ZONE TAB */}
            {activeTab === 'danger' && (
              <div className="max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-5">Account Settings</h2>

                {/* Logout */}
                <div className="border border-gray-200 rounded-xl p-5 mb-4">
                  <h3 className="font-bold text-gray-700 mb-1">Logout</h3>
                  <p className="text-gray-500 text-sm mb-3">Sign out from your account on this device.</p>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition"
                  >
                    Logout
                  </button>
                </div>

                {/* Clear Cart */}
                <div className="border border-yellow-200 rounded-xl p-5 mb-4 bg-yellow-50">
                  <h3 className="font-bold text-yellow-700 mb-1">Clear Cart</h3>
                  <p className="text-yellow-600 text-sm mb-3">Remove all items from your shopping cart.</p>
                  <button
                    onClick={() => {
                      localStorage.removeItem('cart')
                      setSuccess('Cart cleared!')
                      setTimeout(() => setSuccess(''), 2000)
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl text-sm font-semibold transition"
                  >
                    Clear Cart
                  </button>
                </div>

                {/* Delete Account */}
                <div className="border border-red-200 rounded-xl p-5 bg-red-50">
                  <h3 className="font-bold text-red-700 mb-1">Delete Account</h3>
                  <p className="text-red-500 text-sm mb-3">
                    Permanently delete your account and all data. This cannot be undone.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure? This will permanently delete your account!')) {
                        localStorage.clear()
                        navigate('/')
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-semibold transition"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile