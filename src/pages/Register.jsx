import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post('http://localhost:8081/api/auth/register', {
        name,
        email,
        password
      })
      navigate('/login')
    } catch (err) {
      setError('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl w-full max-w-md p-8">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">StayGenie</h1>
          <p className="text-white/70 mt-2">AI-Powered Hotel Booking</p>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-2">Create account</h2>
        <p className="text-white/60 text-sm mb-6">Start your AI-powered travel journey</p>

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          <button
  type="submit"
  disabled={loading}
  style={{ backgroundColor: '#1a2f5e' }}
  className="w-full hover:opacity-90 text-white font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-50 text-lg mt-2"
>
  {loading ? 'Creating account...' : 'Create Account'}
</button>
        </form>

        <p className="text-center text-white/60 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-semibold hover:underline">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  )
}