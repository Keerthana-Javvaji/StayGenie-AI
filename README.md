# StayGenie AI 🏨✨
### AI-Powered Hotel Booking & Personalized Travel Planning Platform

> A full-stack AI-powered hotel booking application where an AI Orchestrator routes user intent to specialized service modules — handling hotel recommendations, automatic bookings, sentiment analysis, and trip planning.

---

## 🌐 Live Demo
- **Frontend:** https://stay-genie-ai-2oc7.vercel.app
- **Backend API:** https://staygenie-backend.onrender.com

> ⚠️ Note: Backend runs on Render free tier — first request may take 30-50 seconds to wake up.

---

## 🤖 AI Components

| Component | Responsibility |
|-----------|---------------|
| 🧠 Orchestrator | Detects user intent and routes to the correct handler |
| 🏨 Hotel Recommendation | Finds and recommends hotels based on city, budget, preferences |
| 📅 Booking Handler | Extracts booking details from natural language and creates bookings |
| 💬 Sentiment Analyzer | Analyzes hotel review sentiment (POSITIVE/NEGATIVE/NEUTRAL) |
| 🗺️ Trip Planner | Generates detailed day-wise travel itineraries |

All AI components use **Groq API (Llama 3.3 70B)** with specialized system prompts.

---

## ⚙️ Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.3.4**
- **Spring Security** + **JWT Authentication**
- **Spring Data JPA** + **PostgreSQL**
- **Groq AI API** (Llama 3.3 70B)
- **REST APIs**

### Frontend
- **React** + **Vite**
- **Tailwind CSS**
- **Axios**
- **React Router DOM**

### Deployment
- **Vercel** — Frontend
- **Render** — Backend + PostgreSQL (Free tier)

---

## 📋 Features

### Authentication
- ✅ JWT-based Register & Login
- ✅ Password hashing with BCrypt
- ✅ Protected routes

### Hotel Module
- ✅ 18 Hotels across 5 Indian cities
- ✅ City Filter Chips (Mumbai, Delhi, Bangalore, Goa, Hyderabad)
- ✅ Search by hotel name or city
- ✅ Hotel detail page with room selection
- ✅ Real-time room availability tracking

### Booking Module
- ✅ Manual booking flow with date selection
- ✅ Payment page (Card / UPI / Net Banking / Pay at Hotel)
- ✅ Server-side price calculation (nights × room price)
- ✅ Room availability decrement on booking
- ✅ Cancel booking from Dashboard or AI Chat

### AI Module
- ✅ Natural language hotel search
- ✅ AI-assisted automatic booking from natural language
- ✅ AI cancel booking
- ✅ AI Trip Planner with day-wise itinerary
- ✅ Review sentiment analysis

### User Dashboard
- ✅ All bookings with status (Upcoming/Past/Cancelled)
- ✅ Cancel booking with confirmation modal
- ✅ Booking statistics

---

## 🏗️ Architecture

```
User (React Frontend)
        ↓
Spring Boot REST APIs (JWT Protected)
        ↓
AI Orchestrator (Intent Detection + Groq API)
        ↓
┌─────────────────────────────────────────┐
│ Hotel Search  │ Booking  │ Trip Planner │
│ Handler       │ Handler  │ Handler      │
│                                         │
│          Sentiment Analyzer             │
└─────────────────────────────────────────┘
        ↓
PostgreSQL Database
```

**Key Design Decision:** AI components call Spring Boot REST APIs for all data operations. Business logic (availability checks, price calculation, authorization) stays in the backend — AI handles only natural language understanding and response generation.

---

## 📁 Project Structure

### Backend
```
src/main/java/com/staygenie/backend/
├── config/
│   ├── JwtFilter.java
│   ├── JwtUtil.java
│   └── SecurityConfig.java
├── controller/
│   ├── AuthController.java
│   ├── BookingController.java
│   ├── ChatController.java
│   ├── HotelController.java
│   ├── ReviewController.java
│   └── RoomController.java
├── entity/
│   ├── Booking.java
│   ├── Hotel.java
│   ├── Review.java
│   ├── Room.java
│   └── User.java
├── repository/
│   ├── BookingRepository.java
│   ├── HotelRepository.java
│   ├── ReviewRepository.java
│   ├── RoomRepository.java
│   └── UserRepository.java
├── service/
│   ├── BookingService.java
│   ├── GroqService.java
│   ├── OrchestratorAgent.java
│   ├── SentimentAgent.java
│   └── TripPlannerAgent.java
├── HotelBackendApplication.java
└── HotelDataLoader.java
```

### Frontend
```
src/
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Hotels.jsx
│   ├── HotelDetail.jsx
│   ├── Payment.jsx
│   ├── Dashboard.jsx
│   ├── Chat.jsx
│   └── TripPlanner.jsx
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🗄️ Database Schema

```sql
users           - id, name, email, password_hash, role, created_at
hotels          - id, name, description, city, address, lat, lng, price_per_night, star_rating
hotel_images    - id, hotel_id, image_url, is_primary
amenities       - id, name
hotel_amenities - hotel_id, amenity_id
rooms           - id, hotel_id, room_type, price_per_night, capacity, total_rooms, available_rooms
bookings        - id, user_id, hotel_id, room_id, check_in_date, check_out_date, guests, total_price, status
reviews         - id, hotel_id, user_id, rating, comment_text, sentiment, created_at
```

---

## 🔧 Local Setup

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL
- Groq API Key (free at https://console.groq.com)

### Backend Setup
```bash
# Clone the repo
git clone https://github.com/Keerthana-Javvaji/StayGenie-AI.git
cd StayGenie-AI

# Copy and configure properties
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Edit application.properties with your values
# Run
./mvnw spring-boot:run
```

### Frontend Setup
```bash
# Switch to frontend branch
git checkout frontend

# Install and run
npm install
npm run dev

# Open http://localhost:5173
```

---

## 🔑 API Endpoints

### Authentication
```
POST /api/auth/register              - Register new user
POST /api/auth/login                 - Login and get JWT token
```

### Hotels
```
GET  /api/hotels                     - Get all hotels
GET  /api/hotels/{id}                - Get hotel by ID
```

### Rooms
```
GET  /api/rooms/hotel/{hotelId}      - Get rooms by hotel
```

### Bookings
```
GET  /api/bookings/my                - Get current user bookings
POST /api/bookings                   - Create new booking
PUT  /api/bookings/{id}/cancel       - Cancel booking
```

### Reviews
```
GET  /api/reviews/hotel/{hotelId}    - Get reviews by hotel
POST /api/reviews                    - Add review with auto sentiment
```

### AI
```
POST /api/chat                       - Chat with AI assistant
POST /api/chat/trip-plan             - Generate trip itinerary
```

---

## 💡 Example AI Interactions

**Hotel Search:**
```
User: "Find me a hotel in Goa under ₹10,000"
AI:   "I recommend Sunrise Beach Inn at ₹4,200/night..."
```

**Automatic Booking:**
```
User: "Book The Taj Mahal Palace for 2 nights from August 1"
AI:   "✅ Booking Confirmed!
       Hotel: The Taj Mahal Palace
       Room: Superior Room
       Total: ₹50,000
       Booking ID: #5"
```

**Trip Planning:**
```
User: "Plan a 3-day trip to Goa"
AI:   "DAY 1:
       🌅 Morning - Fort Aguada, Calangute Beach
       ☀️ Afternoon - Lunch at Infanta Restaurant
       🌙 Evening - Tito's Nightclub, Souza Lobo..."
```

**Sentiment Analysis:**
```
Review: "Absolutely incredible stay!"
Result: POSITIVE ✅
```

---

## 👩‍💻 Developer

**Keerthana Javvaji**
- GitHub: [@Keerthana-Javvaji](https://github.com/Keerthana-Javvaji)

---

## 📄 License
This project is built as a Final Year Project for academic purposes.

---

⭐ Star this repo if you found it useful!