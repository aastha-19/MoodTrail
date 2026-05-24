# 🌍 MoodTrail

A modern, full-stack web application designed to help users discover nearby locations based on their current mood and real-time location. The app fetches real-world data, lists out optimal spots, calculates distance, and plots everything on an interactive map.

## 🚀 Features

*   **Location & Mood Based:** Suggests nearby places by cross-referencing your GPS location with your selected "vibe".
*   **Real-time Map Integration:** Plots all suggestions on a responsive, auto-zooming Leaflet map.
*   **Distance Calculation:** Automatically computes the straight-line distance (using the Haversine formula) to each suggested location.
*   **Wishlist System:** Allows users to save favorite places locally so they persist across sessions.
*   **Interactive UI:** Card hover states seamlessly highlight the corresponding map marker.
*   **Mobile Ready:** Includes a clean toggle switch to navigate between the List View and Map View on smaller devices.

## 💻 Tech Stack

*   **Frontend:** React, Vite, React Router, React Leaflet (Map UI), Lucide React (Icons).
*   **Backend:** Node.js, Express.js, CORS.
*   **APIs:** Google Places API (Text Search API), Geolocation API.

---

## 🛠️ Getting Started (Local Development)

### 1. Requirements
Ensure you have Node.js installed. You will also need a **Google Maps API Key** with the Places API enabled.

### 2. Configure Backend
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update your `.env` file inside the `server/` folder and add your key:
   ```env
   GOOGLE_MAPS_API_KEY=your_google_api_key_here
   PORT=5000
   ```
4. Start the backend:
   ```bash
   node index.js
   ```

### 3. Configure Frontend
1. Open a new terminal and stay in the root project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

---

## 📦 Deployment Instructions

Looking to show this off in your portfolio? Here is the easiest way to deploy this full-stack application for free!

### Deploying the Backend (Render / Railway / Heroku)
1. Push your code to a GitHub repository.
2. Create an account on [Render](https://render.com/).
3. Create a new **Web Service**.
4. Connect your GitHub repo and configure the setup:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
5. Go to the **Environment Variables** section and safely add your `GOOGLE_MAPS_API_KEY`.
6. Deploy! Render will give you a live URL (e.g., `https://nearby-places-backend.onrender.com`).

### Deploying the Frontend (Vercel / Netlify)
1. Since the backend now has a physical live URL, you need to update the fetch logic in your frontend. 
   - Open `src/pages/Results.jsx`.
   - Find the URL `http://localhost:5000/places` and change it to your new Render backend URL (e.g., `https://nearby-places-backend.onrender.com/places`).
2. Login to [Vercel](https://vercel.com/) and create a new project.
3. Import the same GitHub repository.
4. Set the **Framework Preset** to Vite.
5. Hit **Deploy**.

Vercel will build your frontend and instantly provide you with a live, portfolio-ready public URL.
