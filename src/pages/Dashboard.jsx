import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Dashboard() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)
  const [showConfirm, setShowConfirm] = useState(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(response.data)
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId)
    try {
      await axios.put(`http://localhost:8081/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Update local state
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
      ))
      setShowConfirm(null)
    } catch (err) {
      alert('Failed to cancel booking. Please try again.')
    } finally {
      setCancellingId(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const today = new Date()

  const upcoming = bookings.filter(b =>
    new Date(b.checkInDate) >= today && b.status !== 'CANCELLED'
  )
  const past = bookings.filter(b =>
    new Date(b.checkOutDate) < today && b.status !== 'CANCELLED'
  )
  const cancelled = bookings.filter(b => b.status === 'CANCELLED')

  const getFilteredBookings = () => {
    if (activeTab === 'upcoming') return upcoming
    if (activeTab === 'past') return past
    if (activeTab === 'cancelled') return cancelled
    return bookings
  }

  const getStatusColor = (status, checkIn, checkOut) => {
    if (status === 'CANCELLED') return 'bg-red-100 text-red-600'
    if (new Date(checkOut) < today) return 'bg-gray-100 text-gray-600'
    if (new Date(checkIn) <= today && new Date(checkOut) >= today) return 'bg-green-100 text-green-600'
    return 'bg-blue-100 text-blue-600'
  }

  const getStatusLabel = (status, checkIn, checkOut) => {
    if (status === 'CANCELLED') return 'Cancelled'
    if (new Date(checkOut) < today) return 'Completed'
    if (new Date(checkIn) <= today && new Date(checkOut) >= today) return 'Active'
    return 'Upcoming'
  }

  const hotelImages = [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&auto=format&fit=crop',
  ]

  const isCancellable = (booking) => {
    return booking.status !== 'CANCELLED' &&
           new Date(booking.checkInDate) > today
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Confirm Cancel Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Cancel Booking?</h3>
              <p className="text-gray-500 text-sm">
                Are you sure you want to cancel your booking at{' '}
                <span className="font-semibold text-gray-800">
                  {showConfirm.hotel?.name}
                </span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancelBooking(showConfirm.id)}
                disabled={cancellingId === showConfirm.id}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
              >
                {cancellingId === showConfirm.id ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1
              onClick={() => navigate('/hotels')}
              className="text-2xl font-bold text-indigo-600 cursor-pointer"
            >
              StayGenie ✨
            </h1>
            <button
              onClick={() => navigate('/hotels')}
              className="text-gray-500 hover:text-indigo-600 text-sm font-medium transition"
            >
              Hotels
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="text-gray-500 hover:text-indigo-600 text-sm font-medium transition"
            >
              🤖 AI Assistant
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm font-medium">👋 {user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div
        className="relative h-48 flex items-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <h2 className="text-3xl font-bold text-white mb-1">My Dashboard</h2>
          <p className="text-white/70">Manage your bookings and travel history</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Profile + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-1 bg-white rounded-3xl shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-3xl font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            <span className="mt-3 bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full">
              {user.role}
            </span>
            <button
              onClick={() => navigate('/chat')}
              style={{ backgroundColor: '#1a2f5e' }}
              className="mt-4 w-full text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90 transition"
            >
              🤖 Ask AI Assistant
            </button>
          </div>

          <div className="md:col-span-3 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl shadow-sm p-6 text-center">
              <p className="text-4xl font-bold text-indigo-600">{bookings.length}</p>
              <p className="text-gray-500 text-sm mt-2">Total Bookings</p>
            </div>
            <div className="bg-white rounded-3xl shadow-sm p-6 text-center">
              <p className="text-4xl font-bold text-green-500">{upcoming.length}</p>
              <p className="text-gray-500 text-sm mt-2">Upcoming Stays</p>
            </div>
            <div className="bg-white rounded-3xl shadow-sm p-6 text-center">
              <p className="text-4xl font-bold text-red-500">{cancelled.length}</p>
              <p className="text-gray-500 text-sm mt-2">Cancelled</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: `All (${bookings.length})` },
            { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
            { key: 'past', label: `Past (${past.length})` },
            { key: 'cancelled', label: `Cancelled (${cancelled.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500">Loading your bookings...</p>
            </div>
          </div>
        ) : getFilteredBookings().length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">🏨</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">Start exploring hotels and make your first booking!</p>
            <button
              onClick={() => navigate('/hotels')}
              style={{ backgroundColor: '#1a2f5e' }}
              className="text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Browse Hotels
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredBookings().map((booking) => (
              <div
                key={booking.id}
                className={`bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition ${
                  booking.status === 'CANCELLED' ? 'opacity-70' : ''
                }`}
              >
                <div className="flex">
                  {/* Hotel Image */}
                  <div className="w-48 h-40 flex-shrink-0 hidden md:block">
                    <img
                      src={hotelImages[booking.id % hotelImages.length]}
                      alt="Hotel"
                      className={`w-full h-full object-cover ${
                        booking.status === 'CANCELLED' ? 'grayscale' : ''
                      }`}
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-800">
                          {booking.hotel?.name || 'Hotel'}
                        </h4>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          getStatusColor(booking.status, booking.checkInDate, booking.checkOutDate)
                        }`}>
                          {getStatusLabel(booking.status, booking.checkInDate, booking.checkOutDate)}
                        </span>
                      </div>

                      <p className="text-gray-500 text-sm mb-3">
                        🛏️ {booking.room?.roomType || 'Room'} &nbsp;·&nbsp;
                        👥 {booking.guests} Guest{booking.guests > 1 ? 's' : ''}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Check-in</p>
                          <p className="font-semibold">{booking.checkInDate}</p>
                        </div>
                        <div className="text-gray-300">→</div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Check-out</p>
                          <p className="font-semibold">{booking.checkOutDate}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total Paid</p>
                        <p className={`text-2xl font-bold ${
                          booking.status === 'CANCELLED' ? 'text-gray-400 line-through' : 'text-indigo-600'
                        }`}>
                          ₹{booking.totalPrice?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Booking #{booking.id}</p>
                      </div>

                      {isCancellable(booking) && (
                        <button
                          onClick={() => setShowConfirm(booking)}
                          className="bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 text-sm font-semibold px-4 py-2 rounded-xl transition border border-red-200"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {booking.status === 'CANCELLED' && (
                        <span className="text-xs text-red-400 font-medium">
                          ❌ Booking Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8 px-6 text-center">
        <h3 className="text-xl font-bold text-indigo-400 mb-1">StayGenie</h3>
        <p className="text-gray-400 text-sm">AI-Powered Hotel Booking & Travel Planning</p>
        <p className="text-gray-500 text-xs mt-3">© 2026 StayGenie. All rights reserved.</p>
      </footer>
    </div>
  )
}