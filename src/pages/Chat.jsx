import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = "https://staygenie-backend.onrender.com"

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm StayGenie AI, your personal travel assistant. Tell me where you want to go, your budget, and I'll find the perfect hotel for you!\n\nExample: *\"I want a hotel in Goa under ₹10,000 per night for 2 guests\"*"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/api/chat`,
  { message: userMessage },
  { headers: { Authorization: `Bearer ${token}` } }
)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.'
      }])
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

  const suggestions = [
    "Find me a luxury hotel in Mumbai",
    "Budget hotels in Goa under ₹5,000",
    "Best 5-star hotels available",
    "Hotels with swimming pool in Goa"
  ]

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
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">StayGenie AI</h1>
                <p className="text-xs text-green-500 font-medium">● Online</p>
              </div>
            </div>
          </div>
          <span className="text-gray-500 text-sm">👋 {user.name}</span>
        </div>
      </nav>

      {/* Chat Area */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-6 flex flex-col">

        {/* Messages */}
        <div className="flex-1 space-y-4 mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <span className="text-white text-xs">🤖</span>
                </div>
              )}
              <div
                className={`max-w-2xl px-5 py-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
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
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-white text-xs">🤖</span>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm px-5 py-4 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="bg-white border border-indigo-200 text-indigo-600 text-sm px-4 py-2 rounded-full hover:bg-indigo-50 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex items-end gap-3 p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about hotels... (Press Enter to send)"
            rows={1}
            className="flex-1 resize-none text-gray-800 text-sm focus:outline-none px-2 py-2 max-h-32"
            style={{ minHeight: '40px' }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{ backgroundColor: '#1a2f5e' }}
            className="text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-40 text-sm flex-shrink-0"
          >
            Send ✈️
          </button>
        </div>
        <p className="text-center text-gray-400 text-xs mt-2">
          Powered by StayGenie AI · Press Enter to send
        </p>
      </div>
    </div>
  )
}
