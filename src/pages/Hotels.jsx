import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ThemeToggle from "../components/ThemeToggle"

export default function Hotels() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('All')
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
  try {
    const response = await axios.get(
      'https://staygenie-backend.onrender.com/api/hotels',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    setHotels(response.data)

  } catch (err) {
    console.error(
      'Failed to fetch hotels:',
      err.response?.data || err.message
    )

  } finally {
    setLoading(false)
  }
}

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const cities = ['All', ...new Set(hotels.map(h => h.city))]

  const filtered = hotels.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase())
    const matchesCity = selectedCity === 'All' || h.city === selectedCity
    return matchesSearch && matchesCity
  })

  const hotelImages = [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop',
  ]

  const starDisplay = (rating) => {
    const full = Math.floor(rating)
    const empty = 5 - full
    return '★'.repeat(full) + '☆'.repeat(empty)
  }

  const cityEmojis = {
    'All': '🌍',
    'Mumbai': '🏙️',
    'Goa': '🏖️',
    'Delhi': '🕌',
    'Bangalore': '💻',
    'Hyderabad': '🏰'
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white drop-shadow">StayGenie ✨</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/trip-planner')}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              🗺️ Trip Planner
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              🤖 AI Assistant
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              📋 My Bookings
            </button>
            <span className="text-white/90 text-sm font-medium">
              👋 {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-white border border-white/30 hover:bg-white/20 px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="relative h-[500px] flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4">
          <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">
            Find Your Perfect Stay
          </h2>
          <p className="text-xl text-white/80 mb-10">
            AI-powered recommendations tailored just for you
          </p>

          {/* Search Bar */}
          {/* Search Bar */}
<div className="flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto border border-white/20">
  <div className="flex items-center pl-5 pr-2">
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
  <input
    type="text"
    placeholder="Search hotels, cities, or destinations..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="flex-1 px-3 py-4 text-gray-800 text-base focus:outline-none bg-transparent"
  />
  <button
    style={{ backgroundColor: '#1a2f5e' }}
    className="text-white px-8 py-4 font-semibold hover:opacity-90 transition text-base m-1.5 rounded-xl"
  >
    Search
  </button>
</div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-2xl">🏨</span>
            <span className="font-semibold">{hotels.length} Hotels</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-2xl">🌍</span>
            <span className="font-semibold">
              {[...new Set(hotels.map(h => h.city))].length} Cities
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-2xl">⭐</span>
            <span className="font-semibold">Top Rated Stays</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-2xl">🤖</span>
            <span className="font-semibold">AI Powered</span>
          </div>
        </div>
      </div>

      {/* City Filter Chips */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <span className="text-gray-500 text-sm font-medium whitespace-nowrap">
              Filter by city:
            </span>
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCity === city
                    ? 'text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={selectedCity === city ? { backgroundColor: '#1a2f5e' } : {}}
              >
                <span>{cityEmojis[city] || '📍'}</span>
                {city}
                {city !== 'All' && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedCity === city
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {hotels.filter(h => h.city === city).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-800">
            {selectedCity === 'All' ? 'All Hotels' : `Hotels in ${selectedCity}`}
            <span className="text-gray-400 font-normal text-lg ml-2">
              ({filtered.length} found)
            </span>
          </h3>
          <p className="text-gray-500 text-sm">Sorted by recommended</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">Finding best hotels for you...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏨</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No hotels found
            </h3>
            <p className="text-gray-500 mb-4">
              Try a different city or search term
            </p>
            <button
              onClick={() => { setSelectedCity('All'); setSearch('') }}
              style={{ backgroundColor: '#1a2f5e' }}
              className="text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Show All Hotels
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((hotel, index) => (
              <div
                key={hotel.id}
                className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={hotelImages[index % hotelImages.length]}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  {/* Star Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
                    ⭐ {hotel.starRating}
                  </div>

                  {/* City Badge */}
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                    {cityEmojis[hotel.city] || '📍'} {hotel.city}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                    {hotel.name}
                  </h4>

                  <p className="text-yellow-500 text-sm mb-3">
                    {starDisplay(hotel.starRating)}
                  </p>

                  <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">
                    {hotel.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Starting from</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-indigo-600">
                          ₹{hotel.pricePerNight?.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-sm">/night</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/hotels/${hotel.id}`)}
                      style={{ backgroundColor: '#1a2f5e' }}
                      className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition duration-200"
                    >
                      View Rooms →
                    </button>
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
        <p className="text-gray-400 text-sm">
          AI-Powered Hotel Booking & Travel Planning
        </p>
        <p className="text-gray-500 text-xs mt-3">
          © 2026 StayGenie. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
