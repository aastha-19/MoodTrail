import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

if (!API_KEY) {
  console.error("❌ API KEY is missing in .env file");
}

const placesCache = new Map();

const moodToQuery = {
  work: "coworking space OR cafe with wifi OR business center",
  relax: "park OR spa OR peaceful cafe OR nature",
  food: "restaurant OR cafe OR food court",
  fun: "gaming zone OR amusement park OR bowling OR arcade",
  date: "romantic restaurant OR rooftop cafe OR fine dining",
  party: "bar OR club OR lounge OR nightlife"
};

app.get("/places", async (req, res) => {
  const { mood, lat, lng } = req.query;

  if (!mood || !lat || !lng) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const query = moodToQuery[mood];

  if (!query) {
    return res.json({ places: [] });
  }

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    query
  )}&location=${lat},${lng}&radius=8000&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google API Error:", data.status, data.error_message);
      
      // Fallback to mock data so the app remains usable even without a valid API key
      const pLat = parseFloat(lat);
      const pLng = parseFloat(lng);
      
      const mockDatabase = {
        work: [
          { id: "w1", name: "The Focused Hub Coworking", rating: 4.8, price_level: 2, lat: pLat + 0.012, lng: pLng + 0.015, photo_reference: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800", offer: "10% off day pass", event: "Networking Mixer at 6PM" },
          { id: "w2", name: "Silent Brew Cafe", rating: 4.5, price_level: 1, lat: pLat - 0.008, lng: pLng + 0.011, photo_reference: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800", offer: null, event: null },
          { id: "w3", name: "Downtown Library", rating: 4.7, price_level: 0, lat: pLat + 0.018, lng: pLng - 0.005, photo_reference: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800", offer: "Free Wifi Access", event: "Author Talk tomorrow" }
        ],
        relax: [
          { id: "r1", name: "Zen Botanical Gardens", rating: 4.9, price_level: 1, lat: pLat + 0.015, lng: pLng + 0.020, photo_reference: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800", offer: null, event: "Guided Meditation 4PM" },
          { id: "r2", name: "Serenity Spa & Wellness", rating: 4.6, price_level: 4, lat: pLat - 0.010, lng: pLng + 0.005, photo_reference: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800", offer: "20% off massages", event: null },
          { id: "r3", name: "Quiet Creek Trail", rating: 4.8, price_level: 0, lat: pLat + 0.022, lng: pLng - 0.012, photo_reference: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", offer: null, event: null }
        ],
        food: [
          { id: "f1", name: "Gourmet Kitchen 101", rating: 4.7, price_level: 3, lat: pLat + 0.005, lng: pLng + 0.008, photo_reference: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800", offer: "Free dessert with mains", event: null },
          { id: "f2", name: "The Spicy Skillet", rating: 4.4, price_level: 2, lat: pLat - 0.004, lng: pLng + 0.015, photo_reference: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", offer: "Happy Hour 4-6PM", event: "Taco Tuesday Special" },
          { id: "f3", name: "Ocean Breeze Seafood", rating: 4.6, price_level: 4, lat: pLat + 0.010, lng: pLng - 0.009, photo_reference: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800", offer: null, event: "Live Acoustic Music" }
        ],
        fun: [
          { id: "e1", name: "Neon Arcade Palace", rating: 4.5, price_level: 2, lat: pLat + 0.020, lng: pLng + 0.010, photo_reference: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800", offer: "Double tokens on Mondays", event: "Pac-Man Tournament" },
          { id: "e2", name: "Adrenaline Trampoline Park", rating: 4.8, price_level: 3, lat: pLat - 0.015, lng: pLng + 0.025, photo_reference: "https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?w=800", offer: null, event: "Dodgeball League" },
          { id: "e3", name: "Strike Zone Bowling", rating: 4.3, price_level: 2, lat: pLat + 0.008, lng: pLng - 0.018, photo_reference: "https://images.unsplash.com/photo-1538510127375-973b8885b27f?w=800", offer: "Buy 1 Get 1 Game", event: null }
        ],
        date: [
          { id: "d1", name: "Starlight Rooftop Lounge", rating: 4.9, price_level: 4, lat: pLat + 0.002, lng: pLng + 0.003, photo_reference: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800", offer: null, event: "Live Jazz Night" },
          { id: "d2", name: "Le Petit Bistro", rating: 4.7, price_level: 3, lat: pLat - 0.006, lng: pLng + 0.008, photo_reference: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", offer: "Complimentary wine tasting", event: null },
          { id: "d3", name: "Candlelight Italian", rating: 4.6, price_level: 3, lat: pLat + 0.012, lng: pLng - 0.004, photo_reference: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800", offer: "15% off Early Bird", event: null }
        ],
        party: [
          { id: "p1", name: "Club Zenith", rating: 4.4, price_level: 4, lat: pLat + 0.015, lng: pLng + 0.022, photo_reference: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800", offer: "Free entry before 11PM", event: "Guest DJ Set" },
          { id: "p2", name: "The Underground Bass", rating: 4.6, price_level: 3, lat: pLat - 0.012, lng: pLng + 0.018, photo_reference: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800", offer: null, event: null },
          { id: "p3", name: "Midnight Mixers Bar", rating: 4.5, price_level: 2, lat: pLat + 0.009, lng: pLng - 0.014, photo_reference: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800", offer: "2-for-1 Cocktails", event: "Trivia Night" }
        ]
      };

      const mockPlaces = mockDatabase[mood] || mockDatabase["work"];
      console.log(`Serving dynamic mock places for mood: ${mood} due to API error.`);
      mockPlaces.forEach(p => {
        placesCache.set(p.id, p);
      });
      return res.json({ places: mockPlaces });
    }

    const places = (data.results || []).map((place) => ({
      id: place.place_id,
      name: place.name,
      rating: place.rating || null,
      price_level: place.price_level || Math.floor(Math.random() * 4) + 1, // Mock if missing
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      photo_reference: place.photos?.[0]?.photo_reference || null,
      offer: Math.random() > 0.7 ? "10% Off Special!" : null,
      event: Math.random() > 0.8 ? "Live Music Tonight" : null
    }));

    places.forEach(p => {
      placesCache.set(p.id, p);
    });

    res.json({ places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/places/photo", async (req, res) => {
  const { photo_reference } = req.query;
  if (!photo_reference) {
    return res.status(400).json({ error: "Missing photo_reference" });
  }

  // If it's an external URL (such as Unsplash for mock data), redirect directly
  if (photo_reference.startsWith("http://") || photo_reference.startsWith("https://")) {
    return res.redirect(photo_reference);
  }

  // If it's a real Google Places reference, fetch and return the buffer securely
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo_reference}&key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send("Error fetching photo from Google");
    }
    res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("Error fetching photo:", err);
    res.status(500).send("Server error fetching photo");
  }
});

const MOCK_PHOTOS_BY_VIBE = {
  work: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    "https://images.unsplash.com/photo-1521737852567-8904786e3790?w=800",
    "https://images.unsplash.com/photo-1527192491265-7e15c55f1ed2?w=800",
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800"
  ],
  relax: [
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800"
  ],
  food: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
  ],
  fun: [
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
    "https://images.unsplash.com/photo-1538510127375-973b8885b27f?w=800",
    "https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?w=800",
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800"
  ],
  date: [
    "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    "https://images.unsplash.com/photo-1522336572468-97b06eca41d4?w=800",
    "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800"
  ],
  party: [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800",
    "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?w=800"
  ]
};

function getVibeFromId(id) {
  if (!id) return "work";
  const firstChar = id.charAt(0);
  if (firstChar === "w") return "work";
  if (firstChar === "r") return "relax";
  if (firstChar === "f") return "food";
  if (firstChar === "e") return "fun";
  if (firstChar === "d") return "date";
  if (firstChar === "p") return "party";
  return "work";
}

function getMockPhotos(id, primaryPhoto) {
  const vibe = getVibeFromId(id);
  const pool = MOCK_PHOTOS_BY_VIBE[vibe] || MOCK_PHOTOS_BY_VIBE.work;
  
  const photos = [];
  if (primaryPhoto) {
    photos.push({ photo_reference: primaryPhoto });
  }
  pool.forEach(photoUrl => {
    if (photoUrl !== primaryPhoto && photos.length < 4) {
      photos.push({ photo_reference: photoUrl });
    }
  });
  return photos;
}

function getMockReviews(name, rating) {
  const roundedRating = Math.round(rating || 4.5);
  return [
    {
      author_name: "Alex Johnson",
      rating: roundedRating,
      text: `Absolutely loved my time at ${name}! The vibe was incredible, staff were super welcoming, and the service was top notch.`,
      relative_time_description: "2 days ago"
    },
    {
      author_name: "Sam Miller",
      rating: Math.max(1, roundedRating - 1),
      text: `Nice spot! ${name} is definitely worth visiting. It can get a bit crowded during peak hours, but that's just because it's so good.`,
      relative_time_description: "2 weeks ago"
    },
    {
      author_name: "Jordan Lee",
      rating: Math.min(5, roundedRating + 1),
      text: `A hidden gem! So glad I found ${name}. The environment is perfect. Highly recommend checking it out!`,
      relative_time_description: "1 month ago"
    }
  ];
}

function getMockPhoneNumber(id) {
  const lastDigit = id.slice(-1);
  const num = isNaN(lastDigit) ? 7 : parseInt(lastDigit);
  return `+1 (555) ${100 + num * 11}-${2000 + num * 111}`;
}

function getMockAddress(id) {
  const streets = ["Mockingbird Lane", "Sunset Boulevard", "Oak Avenue", "Pine Street", "Broadway", "Maple Drive"];
  const cities = ["Metropolis", "Gotham", "Riverdale", "Hill Valley", "Emerald City", "Star City"];
  const lastDigit = id.slice(-1);
  const idx = isNaN(lastDigit) ? 0 : parseInt(lastDigit) % streets.length;
  
  return `${100 + idx * 75} ${streets[idx]}, ${cities[idx]}, CA 90210`;
}

app.get("/places/details", async (req, res) => {
  const { place_id } = req.query;
  if (!place_id) return res.status(400).json({ error: "Missing place_id" });

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,rating,reviews,photos,opening_hours,formatted_phone_number,url,formatted_address&key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "OK" || !data.result) {
      // Mock data for details if API fails or quota exceeded
      const cached = placesCache.get(place_id) || {};
      const name = cached.name || "Special Nearby Spot";
      const rating = cached.rating || 4.5;
      const primaryPhoto = cached.photo_reference || null;

      const photos = getMockPhotos(place_id, primaryPhoto);

      return res.json({
        result: {
          name,
          rating,
          reviews: getMockReviews(name, rating),
          opening_hours: { open_now: true },
          photos: photos,
          formatted_phone_number: getMockPhoneNumber(place_id),
          formatted_address: getMockAddress(place_id),
          mock_crowd_level: Math.floor(Math.random() * 100), // Mock crowd level 0-100%
          offer: cached.offer || (Math.random() > 0.5 ? "10% off with MoodTrail app!" : null),
          event: cached.event || (Math.random() > 0.8 ? "Special event today" : null)
        }
      });
    }

    // Add mock crowd level, offer, and event to real data since Google doesn't provide it directly
    data.result.mock_crowd_level = Math.floor(Math.random() * 100);
    data.result.offer = Math.random() > 0.5 ? "Exclusive 15% off today!" : null;
    data.result.event = Math.random() > 0.6 ? "Special Event Tonight at 8PM" : null;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/places/sos", async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: "Missing location" });

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=hospital&key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return res.json({ places: [{ name: "City General Hospital", lat: parseFloat(lat)+0.01, lng: parseFloat(lng)+0.01 }] });
    }
    
    const places = (data.results || []).slice(0, 3).map(p => ({
      id: p.place_id,
      name: p.name,
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
      vicinity: p.vicinity
    }));
    res.json({ places });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/chat", (req, res) => {
  const { message, mood } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  const msgLower = message.toLowerCase();
  let reply = "I can help you find places around here! What are you looking for?";
  
  if (msgLower.includes("quiet") || msgLower.includes("peaceful")) {
    reply = "If you're looking for peace and quiet, I highly recommend checking out nearby parks or cozy libraries.";
  } else if (msgLower.includes("food") || msgLower.includes("hungry")) {
    reply = "There are some great restaurants nearby! Have you checked the 'Food' vibe in the app?";
  } else if (msgLower.includes("crowd") || msgLower.includes("busy")) {
    reply = "You can click on any place card to see its estimated crowd level right now.";
  } else if (mood) {
    reply = `Since you're in a '${mood}' mood, I'd suggest checking out the top-rated spots on your map right now.`;
  }

  // Simulated typing delay
  setTimeout(() => {
    res.json({ reply });
  }, 1000);
});

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
