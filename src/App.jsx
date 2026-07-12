import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Hotels from './pages/Hotels'
import HotelDetail from './pages/HotelDetail'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import TripPlanner from './pages/TripPlanner'
import Payment from './pages/Payment'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/:id" element={<HotelDetail />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App