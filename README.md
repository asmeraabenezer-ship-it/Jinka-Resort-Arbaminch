# Jinka Resort - Luxury Hotel & Resort Website

A highly professional, modern, and luxury resort website built with HTML, CSS, JavaScript (Frontend) and Node.js, Express.js, MongoDB (Backend).

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
  
- **Backend**:
  - Node.js and Express.js REST API
  - MongoDB database integration with Mongoose
  - Models for User, Room, Booking, MenuItem, and Order
  - Routes for standard CRUD operations and Admin dashboard functions
  - JWT Authentication ready

## Folder Structure
```
jinkaResort/
│
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── controllers/         # (Optional) Controller logic
│   ├── models/              # Mongoose Schemas (User, Room, Booking, MenuItem, Order)
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

## Deployment Guide

### Prerequisites
1. Install [Node.js](https://nodejs.org/).
2. Install [MongoDB](https://www.mongodb.com/try/download/community) or set up a MongoDB Atlas cloud database.
3. Install dependencies for the backend.

### Running Locally

**1. Setup Backend:**
```bash
cd backend
npm install
```

Make sure your `.env` file is set properly:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/jinkaresort
JWT_SECRET=your_super_secret_key
```

Start the backend server:
```bash
npm run dev
# OR
npm start
```
The server will run on `http://localhost:5000`.

**2. Setup Frontend:**
Since the frontend is built with pure HTML, CSS, and JS:
- You can simply open `frontend/index.html` in your web browser.
- Alternatively, use the **Live Server** extension in VS Code for hot-reloading during development.
- In production, you can configure `server.js` to serve the static frontend folder:
  ```javascript
  app.use(express.static('../frontend'));
  ```

### Production Deployment (e.g., Heroku, Vercel, Render)

1. **Backend Deployment (Render / Railway / Heroku):**
   - Push your repository to GitHub.
   - Connect the `backend` folder to a service like Render.
   - Add environment variables (`MONGO_URI`, `JWT_SECRET`) in the deployment dashboard.
   - Ensure the startup command is `node server.js`.

2. **Frontend Deployment (Vercel / Netlify / GitHub Pages):**
   - Connect the `frontend` directory to Vercel or Netlify.
   - Set the build command to empty (since it's static HTML/CSS/JS).
   - Once deployed, update the API fetch URLs in `frontend/js/main.js` (if implemented to fetch from backend) to point to your deployed backend URL.

3. **Database (MongoDB Atlas):**
   - Create a free cluster on MongoDB Atlas.
   - Whitelist all IP addresses (`0.0.0.0/0`) or specific deployed server IPs.
   - Copy the connection string and place it in the `MONGO_URI` environment variable.

---
**Enjoy building and expanding your Luxury Resort Platform!**
