import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function TripPlanner() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "🗺️ Hi! I'm your StayGenie Trip Planner!\n\nTell me where you want to go and for how many days, and I'll create a complete personalized itinerary for you!\n\nExample: *\"Plan a 3-day trip to Goa for 2 people\"*"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const suggestions = [
    "Plan a 3-day trip to Goa",
    "Plan a 2-day trip to Mumbai",
    "Plan a 4-day trip to Delhi",
    "Plan a 3-day trip to Bangalore",
    "Plan a 5-day trip to Hyderabad"
  ]

 const sendMessage = async () => {
  if (!input.trim() || loading) return

  const userMessage = input.trim()

  setInput('')

  setMessages(prev => [
    ...prev,
    {
      role: 'user',
      content: userMessage
    }
  ])

  setLoading(true)

  try {
    const response = await axios.post(
      'https://staygenie-backend.onrender.com/api/chat',
      {
        message: userMessage
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: response.data.response
      }
    ])

  } catch (err) {

    console.error(
      'AI Chat Error:',
      err.response?.data || err.message
    )

    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.'
      }
    ])

  } finally {
    setLoading(false)
  }
}

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/hotels')}
              className="text-gray-500 hover:text-indigo-600 transition font-medium"
            >
              ← Hotels
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🗺️</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Trip Planner AI</h1>
                <p className="text-xs text-green-500 font-medium">● Online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/chat')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              🤖 AI Booking
            </button>
            <span className="text-gray-500 text-sm">👋 {user.name}</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div
        className="relative h-40 flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-1">AI Trip Planner</h2>
          <p className="text-white/70">Get a personalized day-by-day travel itinerary</p>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-6 flex flex-col">
        <div className="flex-1 space-y-4 mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <span className="text-white text-xs">🗺️</span>
                </div>
              )}
              <div
                className={`max-w-3xl px-5 py-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 shadow-sm rounded-tl-sm border border-gray-100'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center ml-3 mt-1 flex-shrink-0">
                  <span className="text-gray-600 text-xs">👤</span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-white text-xs">🗺️</span>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm px-5 py-4 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                  <span className="text-gray-400 text-xs ml-2">Planning your trip...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="bg-white border border-green-200 text-green-600 text-sm px-4 py-2 rounded-full hover:bg-green-50 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex items-end gap-3 p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me where you want to go and for how many days..."
            rows={1}
            className="flex-1 resize-none text-gray-800 text-sm focus:outline-none px-2 py-2 max-h-32"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold transition disabled:opacity-40 text-sm flex-shrink-0"
          >
            Plan Trip 🗺️
          </button>
        </div>
        <p className="text-center text-gray-400 text-xs mt-2">
          Powered by StayGenie Trip Planner AI · Press Enter to send
        </p>
      </div>
    </div>
  )
}
