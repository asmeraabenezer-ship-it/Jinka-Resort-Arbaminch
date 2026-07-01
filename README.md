# Jinka-Resort-Arbaminch
where culture meets world class hospitality exprience the breathtaking city location Arbaminch Ethiopia

A highly professional, modern, and luxury resort website built with HTML, CSS, JavaScript (Frontend) and Node.js, Express.js, Supabase/JSON Local DB (Backend).

## Features
- **Frontend**:
  - Fullscreen cinematic background video in hero section
  - Smooth entrance animations and scroll animations (Intersection Observer)
  - Transparent glassmorphism navigation bar
  - Animated text overlay with resort slogan
  - "Book Now" and "Order Food" functionalities via Modals
  - Luxury typography and elegant spacing
  - Interactive hover effects and modern cards
  - Fully responsive design (Mobile, Tablet, Desktop)
  - Embedded TikTok video section and live profile card
  - Interactive Google Maps location block
  
- **Backend**:
  - Node.js and Express.js REST API
  - Supabase client config with local JSON file fallback database
  - Models for User, Room, Booking, MenuItem, and Order
  - Routes for standard CRUD operations and Admin dashboard functions
  - JWT Authentication ready

## Folder Structure
```
jinkaResort/
│
├── backend/
│   ├── config/
│   │   └── supabase.js      # Database client configuration
│   ├── data/                # Local database fallback JSON files
│   ├── routes/              # Express API Routes (users, rooms, bookings, menu, orders, admin)
│   ├── .env                 # Environment variables
│   ├── package.json         # Backend dependencies
│   └── server.js            # Main backend server entry point
│
└── frontend/
    ├── css/
    │   └── style.css        # Core styles, responsive design, animations
    ├── js/
    │   └── main.js          # DOM manipulation, Modals, Cart logic
    ├── index.html           # Main UI template
    └── assets/              # Store custom images/videos here
```

## Running Locally

**1. Setup Backend:**
```bash
cd backend
npm install
npm run dev
```
The server will run on `http://localhost:5000`.

**2. Setup Frontend:**
You can open `frontend/index.html` in your web browser, or use **Live Server** extension in VS Code.
