import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const API_URL = "https://staygenie-backend.onrender.com"

export default function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [bookingError, setBookingError] = useState('')

  // Review states
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState('')

  const hotelImages = [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop',
  ]

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchHotelAndRooms()
  }, [])

  const fetchHotelAndRooms = async () => {
    try {
      const [hotelRes, roomsRes, reviewsRes] = await Promise.all([
        axios.get(`${API_URL}/api/hotels`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/rooms/hotel/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/reviews/hotel/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
})
      ])
      const found = hotelRes.data.find(h => h.id === parseInt(id))
      setHotel(found)
      setRooms(roomsRes.data)
      setReviews(reviewsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = () => {
    if (!selectedRoom || !checkIn || !checkOut) {
      setBookingError('Please select a room and dates.')
      return
    }

    const nights = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    )

    if (nights <= 0) {
      setBookingError('Check-out date must be after check-in date.')
      return
    }

    const totalPrice = selectedRoom.pricePerNight * nights

    navigate('/payment', {
      state: {
        hotel,
        room: selectedRoom,
        checkIn,
        checkOut,
        guests,
        totalPrice
      }
    })
  }

  const submitReview = async () => {
    if (!reviewText.trim() || reviewRating === 0) return
    setReviewLoading(true)
    setReviewSuccess('')
    try {
      const response = await axios.post(`${API_URL}/api/reviews`, {
        hotelId: parseInt(id),
        rating: reviewRating,
        commentText: reviewText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReviewSuccess(response.data.sentiment)
      setReviewText('')
      setReviewRating(0)
      const reviewsRes = await axios.get(
        `${API_URL}/api/reviews/hotel/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setReviews(reviewsRes.data)
    } catch (err) {
      console.error('Failed to submit review:', err)
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-4">🏨</div>
        <p className="text-gray-500 text-lg">Loading hotel details...</p>
      </div>
    </div>
  )

  if (!hotel) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Hotel not found.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/hotels')}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition font-medium"
          >
            ← Back to Hotels
          </button>
          <h1 className="text-xl font-bold text-indigo-600">StayGenie ✨</h1>
          <span className="text-gray-500 text-sm">👋 {user.name}</span>
        </div>
      </nav>

      {/* Hero Image */}
      <div
        className="h-80 relative"
        style={{
          backgroundImage: `url(${hotelImages[parseInt(id) % hotelImages.length]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-8 left-8 text-white">
          <h2 className="text-4xl font-bold drop-shadow-lg">{hotel.name}</h2>
          <p className="text-white/80 mt-2 text-lg">
            📍 {hotel.city} · {hotel.address}
          </p>
          <p className="text-yellow-400 text-xl mt-1">
            {'★'.repeat(Math.floor(hotel.starRating))} {hotel.starRating} stars
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Hotel Info + Rooms + Reviews */}
        <div className="lg:col-span-2 space-y-8">

          {/* About */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">About this hotel</h3>
            <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">
                  ₹{hotel.pricePerNight?.toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm">Starting per night</p>
              </div>
              <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">
                  ⭐ {hotel.starRating}
                </p>
                <p className="text-gray-500 text-sm">Star Rating</p>
              </div>
            </div>
          </div>

          {/* Rooms */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Available Rooms</h3>
            {rooms.length === 0 ? (
              <p className="text-gray-400">No rooms available at the moment.</p>
            ) : (
              <div className="space-y-4">
                {rooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
                      selectedRoom?.id === room.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-100 hover:border-indigo-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">
                          {room.roomType}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>👥 Up to {room.capacity} guests</span>
                          <span>🛏️ {room.availableRooms} rooms left</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">
                          ₹{room.pricePerNight?.toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-sm">/night</p>
                        {selectedRoom?.id === room.id && (
                          <span className="text-indigo-600 text-xs font-semibold">
                            ✓ Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Guest Reviews</h3>

            {/* Add Review Form */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Write a Review</h4>

              {/* Star Rating */}
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`text-3xl transition ${
                      star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-gray-400 text-sm ml-2 self-center">
                  {reviewRating > 0 ? `${reviewRating}/5` : 'Select rating'}
                </span>
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience at this hotel..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none mb-3"
              />

              {reviewSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm mb-3 flex items-center gap-2">
                  ✅ Review submitted! AI detected sentiment:
                  <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                    reviewSuccess === 'POSITIVE' ? 'bg-green-100 text-green-700' :
                    reviewSuccess === 'NEGATIVE' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {reviewSuccess}
                  </span>
                </div>
              )}

              <button
                onClick={submitReview}
                disabled={reviewLoading || !reviewText.trim() || reviewRating === 0}
                style={{ backgroundColor: '#1a2f5e' }}
                className="text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-40"
              >
                {reviewLoading ? 'Analyzing sentiment...' : 'Submit Review'}
              </button>
            </div>

            {/* Existing Reviews */}
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-gray-400">
                  No reviews yet. Be the first to review!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div
                    key={review.id}
                    className="border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-bold">
                            {review.user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {review.user?.name || 'Guest'}
                          </p>
                          <p className="text-yellow-400 text-sm">
                            {'★'.repeat(review.rating)}
                            {'☆'.repeat(5 - review.rating)}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        review.sentiment === 'POSITIVE'
                          ? 'bg-green-100 text-green-600'
                          : review.sentiment === 'NEGATIVE'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {review.sentiment === 'POSITIVE' ? '😊 Positive' :
                         review.sentiment === 'NEGATIVE' ? '😞 Negative' :
                         '😐 Neutral'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {review.commentText}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-24">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Book Your Stay</h3>

            {selectedRoom && (
              <div className="bg-indigo-50 rounded-2xl p-4 mb-4">
                <p className="text-sm font-medium text-indigo-800">
                  Selected: {selectedRoom.roomType}
                </p>
                <p className="text-indigo-600 font-bold">
                  ₹{selectedRoom.pricePerNight?.toLocaleString()}/night
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800"
                >
                  {[1, 2, 3, 4].map(n => (
                    <option key={n} value={n}>
                      {n} Guest{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Preview */}
              {selectedRoom && checkIn && checkOut && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm">
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span>
                      ₹{selectedRoom.pricePerNight?.toLocaleString()} ×{' '}
                      {Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} nights
                    </span>
                    <span className="font-semibold text-indigo-600">
                      ₹{(selectedRoom.pricePerNight *
                        Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Taxes & fees</span>
                    <span className="text-green-600">Included</span>
                  </div>
                </div>
              )}

              {bookingError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {bookingError}
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!selectedRoom}
                style={{ backgroundColor: '#1a2f5e' }}
                className="w-full text-white font-semibold py-3 rounded-xl hover:opacity-90 transition duration-200 disabled:opacity-40 text-lg"
              >
                Proceed to Payment →
              </button>

              {!selectedRoom && (
                <p className="text-center text-gray-400 text-xs">
                  ← Select a room first
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
