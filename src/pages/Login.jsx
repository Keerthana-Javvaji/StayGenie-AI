import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(
        'https://staygenie-backend.onrender.com/api/auth/login',
        {
          email,
          password
        }
      )

      // Store JWT token
      localStorage.setItem('token', response.data.token)

      // Store user details
      localStorage.setItem(
        'user',
        JSON.stringify({
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        })
      )

      // Redirect after successful login
      navigate('/hotels')

    } catch (err) {
      console.error(err)
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>


      {/* Login Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl w-full max-w-md p-8">


        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            StayGenie
          </h1>

          <p className="text-white/70 mt-2">
            AI-Powered Hotel Booking
          </p>
        </div>


        <h2 className="text-2xl font-semibold text-white mb-2">
          Welcome back
        </h2>

        <p className="text-white/60 text-sm mb-6">
          Sign in to continue your journey
        </p>



        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}



        <form onSubmit={handleLogin} className="space-y-4">


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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>


        </form>



        <p className="text-center text-white/60 text-sm mt-6">
          Don't have an account?{' '}

          <Link
            to="/register"
            className="text-white font-semibold hover:underline"
          >
            Create one free
          </Link>

        </p>


      </div>

    </div>
  )
}
