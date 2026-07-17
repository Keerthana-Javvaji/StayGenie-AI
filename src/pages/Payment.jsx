import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

export default function Payment() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')

  const { hotel, room, checkIn, checkOut, guests, totalPrice } = location.state || {}

  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [processing, setProcessing] = useState(false)
  const [bookingId, setBookingId] = useState(null)
  const [upiId, setUpiId] = useState('')

  useEffect(() => {
    if (!token || !hotel) {
      navigate('/hotels')
    }
  }, [])

  const formatCard = (val) => {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
  }

  const formatExpiry = (val) => {
    return val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5)
  }

  
  const handlePayment = async () => {
  setProcessing(true)
  setStep(2)

  await new Promise(resolve => setTimeout(resolve, 2500))

  try {
    const response = await axios.post(
      'https://staygenie-backend.onrender.com/api/bookings',
      {
        hotel: {
          id: hotel.id
        },
        room: {
          id: room.id
        },
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: guests
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    setBookingId(response.data.id)
    setStep(3)

  } catch (err) {
    console.error(
      'Booking failed:',
      err.response?.data || err.message
    )

    setStep(1)
    setProcessing(false)
  }
}

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
    : 0

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {paymentMethod === 'manual' ? 'Confirming Reservation...' : 'Processing Payment...'}
          </h2>
          <p className="text-gray-500">Please wait while we confirm your booking...</p>
          <div className="mt-6 space-y-2 text-sm text-gray-400">
            <p>🔒 Securing your booking...</p>
            <p>✅ Verifying details...</p>
            <p>🏨 Confirming with hotel...</p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">
            {paymentMethod === 'manual' ? 'Reservation Confirmed!' : 'Payment Successful!'}
          </h2>
          <p className="text-gray-500 mb-6">
            {paymentMethod === 'manual'
              ? 'Your room is reserved. Please pay at check-in.'
              : 'Your booking has been confirmed'}
          </p>

          <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Hotel</span>
              <span className="font-semibold text-gray-800">{hotel?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Room</span>
              <span className="font-semibold text-gray-800">{room?.roomType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-in</span>
              <span className="font-semibold text-gray-800">{checkIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-out</span>
              <span className="font-semibold text-gray-800">{checkOut}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Guests</span>
              <span className="font-semibold text-gray-800">{guests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className="font-semibold text-gray-800">
                {paymentMethod === 'card' ? '💳 Card' :
                 paymentMethod === 'upi' ? '📱 UPI' :
                 paymentMethod === 'netbanking' ? '🏦 Net Banking' :
                 '💵 Pay at Hotel'}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-bold text-indigo-600 text-xl">
                ₹{totalPrice?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Booking ID</span>
              <span className="font-semibold text-green-600">#{bookingId}</span>
            </div>
          </div>

          {paymentMethod === 'manual' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm text-yellow-700">
              ⚠️ Please arrive before 6:00 PM or call the hotel to confirm.
            </div>
          )}

          <div className="space-y-3">
            <button
  onClick={() => {
    window.location.href = '/dashboard'
  }}
  style={{ backgroundColor: '#1a2f5e' }}
  className="w-full text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
>
  View My Bookings
</button>
            <button
  onClick={() => {
    window.location.href = '/hotels'
  }}
  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
>
  Browse More Hotels
</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-indigo-600 font-medium"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-indigo-600">StayGenie ✨</h1>
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            🔒 Secure Payment
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left: Payment Form */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'card', label: '💳 Card' },
                { id: 'upi', label: '📱 UPI' },
                { id: 'netbanking', label: '🏦 Net Banking' },
                { id: 'manual', label: '💵 Pay at Hotel' },
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`py-3 rounded-xl text-sm font-semibold border-2 transition ${
                    paymentMethod === method.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card Details */}
          {paymentMethod === 'card' && (
            <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-800 mb-2">Card Details</h3>

              {/* Card Preview */}
              <div
                className="rounded-2xl p-5 text-white mb-4 h-40 flex flex-col justify-between"
                style={{ background: 'linear-gradient(135deg, #1a2f5e, #4f46e5)' }}
              >
                <div className="flex justify-between items-start">
                  <span className="text-white/70 text-sm">StayGenie Pay</span>
                  <span className="text-2xl">💳</span>
                </div>
                <div>
                  <p className="text-lg font-mono tracking-widest mb-2">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>{cardName || 'CARD HOLDER'}</span>
                    <span>{expiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="YOUR NAME"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.slice(0, 3))}
                    placeholder="•••"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* UPI */}
          {paymentMethod === 'upi' && (
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">UPI Payment</h3>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="Enter UPI ID (e.g. name@upi)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
              />
              <p className="text-gray-500 text-sm mb-3">Or pay using:</p>
              <div className="grid grid-cols-4 gap-3">
                {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                  <div
                    key={app}
                    className="bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-xl p-3 text-center text-sm font-medium text-gray-600 cursor-pointer transition"
                  >
                    {app}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Net Banking */}
          {paymentMethod === 'netbanking' && (
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Select Your Bank</h3>
              <div className="grid grid-cols-2 gap-3">
                {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'PNB'].map(bank => (
                  <button
                    key={bank}
                    className="border-2 border-gray-200 hover:border-indigo-400 rounded-xl p-3 text-sm font-medium text-gray-600 hover:text-indigo-600 transition text-left"
                  >
                    🏦 {bank}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pay at Hotel */}
          {paymentMethod === 'manual' && (
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Pay at Hotel</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏨</span>
                  <div>
                    <p className="font-semibold text-gray-800">Pay at Check-in</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Your room will be reserved and you pay directly at the
                      hotel reception when you arrive.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold text-gray-800">Free Cancellation</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Cancel anytime before check-in at no charge.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💵</span>
                  <div>
                    <p className="font-semibold text-gray-800">Accepted Payments</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Cash, Card, and UPI accepted at the hotel.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700">
                ⚠️ Please arrive before 6:00 PM or call ahead to confirm your reservation.
              </div>
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={processing}
            style={{
              backgroundColor: paymentMethod === 'manual' ? '#16a34a' : '#1a2f5e'
            }}
            className="w-full text-white font-bold py-4 rounded-2xl hover:opacity-90 transition disabled:opacity-50 text-lg"
          >
            {paymentMethod === 'manual'
              ? '🏨 Reserve Now · Pay at Hotel'
              : `🔒 Pay ₹${totalPrice?.toLocaleString()} Securely`
            }
          </button>

          <p className="text-center text-gray-400 text-xs">
            🔒 256-bit SSL encrypted · Your payment info is safe
          </p>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-800 text-lg mb-5">Booking Summary</h3>

            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop"
              alt="Hotel"
              className="w-full h-40 object-cover rounded-2xl mb-5"
            />

            <h4 className="font-bold text-gray-800 text-lg">{hotel?.name}</h4>
            <p className="text-gray-500 text-sm mt-1 mb-4">🛏️ {room?.roomType}</p>

            <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Check-in</span>
                <span className="font-medium">{checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-out</span>
                <span className="font-medium">{checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">
                  {nights} Night{nights > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Guests</span>
                <span className="font-medium">{guests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">
                  ₹{room?.pricePerNight?.toLocaleString()} × {nights} nights
                </span>
                <span className="font-medium">
                  ₹{totalPrice?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Taxes & fees</span>
                <span className="font-medium text-green-600">Included</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-bold text-gray-800 text-lg">Total</span>
                <span className="font-bold text-indigo-600 text-xl">
                  ₹{totalPrice?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 bg-green-50 rounded-xl p-3 text-center">
              <p className="text-green-600 text-sm font-medium">
                🎉 Free cancellation before check-in
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
