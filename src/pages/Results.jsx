import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Heart, Map, List, Loader2, MapPinOff, AlertTriangle, Layers, ArrowLeft, Filter, Tag, Calendar, DollarSign, Star } from "lucide-react";
import PlaceDetailsModal from "../components/PlaceDetailsModal";

// Markers
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [35, 51], // Larger to show highlight
  iconAnchor: [17, 51],
});

// Haversine formula for distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

// Component to handle map fit bounds when places load
function MapFitter({ places }) {
  const map = useMap();
  useEffect(() => {
    if (places.length > 0) {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [places, map]);
  return null;
}

export default function Results() {
  const [searchParams] = useSearchParams();
  const mood = searchParams.get("mood");

  const [places, setPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // New States
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("nearbyPlacesWishlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const [mobileView, setMobileView] = useState("list"); // 'list' | 'map'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);

  // Filters
  const [filterRating, setFilterRating] = useState(0); 
  const [filterDistance, setFilterDistance] = useState(20); 
  const [filterPrice, setFilterPrice] = useState(0); 

  const filteredPlaces = places.filter(place => {
    if (filterRating > 0 && (place.rating || 0) < filterRating) return false;
    if (filterPrice > 0 && place.price_level && place.price_level !== filterPrice) return false;
    if (userLocation) {
      const dist = parseFloat(getDistance(userLocation[0], userLocation[1], place.lat, place.lng));
      if (dist > filterDistance) return false;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("nearbyPlacesWishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (!mood) {
      setError("Mood not provided. Please go back and select a mood.");
      setLoading(false);
      return;
    }

    const urlLat = searchParams.get("lat");
    const urlLng = searchParams.get("lng");

    const fetchPlaces = async (lat, lng) => {
      setUserLocation([lat, lng]);
      try {
        const res = await fetch(
          `http://localhost:5000/places?mood=${mood}&lat=${lat}&lng=${lng}`
        );
        const data = await res.json();
        setPlaces(data.places || []);
      } catch (err) {
        setError("Failed to connect to the server. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    if (urlLat && urlLng) {
      fetchPlaces(parseFloat(urlLat), parseFloat(urlLng));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          fetchPlaces(lat, lng);
        },
        () => {
          console.warn("Geolocation failed or timed out. Falling back to default coordinates.");
          // Fallback to default coordinates (San Francisco)
          fetchPlaces(37.7749, -122.4194);
        },
        { timeout: 5000 }
      );
    }
  }, [mood, searchParams]);

  const toggleWishlist = (place) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === place.id);
      if (exists) {
        return prev.filter((p) => p.id !== place.id);
      }
      return [...prev, place];
    });
  };

  if (loading) {
    return (
      <div className="full-page-message">
        <Loader2 size={48} className="spinner text-primary mb-16" />
        <h3 className="message-title">Discovering places for your mood...</h3>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-page-message p-20 text-center">
        <AlertTriangle size={64} className="text-error mb-16" />
        <h2 className="error-title">Oops! Something went wrong</h2>
        <p className="error-desc">{error}</p>
        <button onClick={() => window.history.back()} className="primary-btn mt-24">Go Back</button>
      </div>
    );
  }

  const isListVisible = !isMobile || mobileView === "list";
  const isMapVisible = !isMobile || mobileView === "map";

  return (
    <div className="results-page-wrapper">
      
      {/* HEADER & MOBILE TOGGLE */}
      <div className="results-header-bar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6b7280', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div>
            <h2 className="header-title">MoodTrail</h2>
            <p className="header-subtitle">Vibe: <b className="text-primary capitalize">{mood}</b></p>
          </div>
        </div>
        
        {isMobile && (
          <div className="mobile-toggle-group">
            <button 
              onClick={() => setMobileView("list")}
              className={`mobile-toggle-btn ${mobileView === "list" ? "active" : ""}`}
            >
              <List size={16} /> List
            </button>
            <button 
              onClick={() => setMobileView("map")}
              className={`mobile-toggle-btn ${mobileView === "map" ? "active" : ""}`}
            >
              <Map size={16} /> Map
            </button>
          </div>
        )}
        
        <button 
          onClick={() => setShowTraffic(!showTraffic)}
          className={`traffic-toggle-btn ${showTraffic ? 'active' : ''}`}
          title="Toggle Traffic Layer"
          style={{ marginLeft: '12px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: showTraffic ? '#e0e7ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Layers size={16} color={showTraffic ? '#4f46e5' : '#6b7280'} />
          <span style={{ color: showTraffic ? '#4f46e5' : '#6b7280', fontWeight: '600', fontSize: '14px' }}>Traffic</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="filter-group">
          <Filter size={16} color="var(--text-secondary)" />
          <select value={filterRating} onChange={(e) => setFilterRating(Number(e.target.value))}>
            <option value={0}>All Ratings</option>
            <option value={4.0}>4.0+ Stars</option>
            <option value={4.5}>4.5+ Stars</option>
          </select>
          <select value={filterDistance} onChange={(e) => setFilterDistance(Number(e.target.value))}>
            <option value={20}>Any Distance</option>
            <option value={1}>Within 1 km</option>
            <option value={3}>Within 3 km</option>
            <option value={5}>Within 5 km</option>
          </select>
          <select value={filterPrice} onChange={(e) => setFilterPrice(Number(e.target.value))}>
            <option value={0}>Any Price</option>
            <option value={1}>$ (Cheap)</option>
            <option value={2}>$$ (Moderate)</option>
            <option value={3}>$$$ (Expensive)</option>
            <option value={4}>$$$$ (Luxury)</option>
          </select>
        </div>
        <div className="results-count">
          Showing {filteredPlaces.length} places
        </div>
      </div>

      <div className="results-content-area">
        
        {/* LEFT SIDE - LIST */}
        {isListVisible && (
          <div className={`places-list-container ${isMobile ? "mobile" : ""}`}>
            {filteredPlaces.length === 0 ? (
              <div className="empty-state">
                <MapPinOff size={48} className="empty-icon" />
                <p>No places found matching your filters.</p>
              </div>
            ) : (
              <div className="places-list">
                {filteredPlaces.map((place) => {
                  const isWishlisted = wishlist.some((p) => p.id === place.id);
                  const distance = userLocation 
                    ? getDistance(userLocation[0], userLocation[1], place.lat, place.lng)
                    : null;

                  return (
                    <div
                      key={place.id}
                      onMouseEnter={() => setHoveredPlaceId(place.id)}
                      onMouseLeave={() => setHoveredPlaceId(null)}
                      onClick={() => setSelectedPlaceId(place.id)}
                      className={`place-card-item ${hoveredPlaceId === place.id ? "hovered" : ""}`}
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(place); }}
                        className="wishlist-btn"
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart size={20} fill={isWishlisted ? "#ef4444" : "none"} color={isWishlisted ? "#ef4444" : "#9ca3af"} className="heart-icon" />
                      </button>

                      <h3 className="place-name">{place.name}</h3>
                      
                      <div className="place-meta">
                        {place.rating && (
                          <span className="rating-badge">
                            {place.rating}
                          </span>
                        )}
                        {place.price_level && (
                          <span className="price-badge">
                            {"$".repeat(place.price_level)}
                          </span>
                        )}
                        {distance && (
                          <span>{distance} km away</span>
                        )}
                      </div>

                      {(place.offer || place.event) && (
                        <div className="place-badges">
                          {place.offer && <span className="offer-badge"><Tag size={12}/> {place.offer}</span>}
                          {place.event && <span className="event-badge"><Calendar size={12}/> {place.event}</span>}
                        </div>
                      )}

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="directions-btn"
                      >
                        <Navigation size={16} />
                        Get Directions
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RIGHT SIDE - MAP */}
        {isMapVisible && (
          <div className="map-view-container">
            {userLocation && (
              <MapContainer
                center={userLocation}
                zoom={13}
                className="full-map"
              >
                <TileLayer
                  url={showTraffic ? "https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}" : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"}
                  attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                />
                
                <MapFitter places={filteredPlaces} />

                {filteredPlaces.map((place) => {
                  const isHovered = hoveredPlaceId === place.id;
                  return (
                    <Marker
                      key={place.id}
                      position={[place.lat, place.lng]}
                      icon={isHovered ? blueIcon : redIcon}
                      zIndexOffset={isHovered ? 1000 : 0}
                    >
                      <Popup>
                        <div style={{ textAlign: "center", minWidth: "120px" }}>
                          <b style={{ display: "block", marginBottom: "8px" }}>{place.name}</b>
                          {place.rating && (
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px", marginBottom: "8px", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                              <Star size={14} fill="#f59e0b" color="#f59e0b" /> {place.rating} / 5.0
                            </span>
                          )}
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: "inline-block", background: "#4f46e5", color: "white", padding: "6px 12px", borderRadius: "6px", textDecoration: "none", fontSize: "0.85rem", width: "100%", boxSizing: "border-box" }}
                          >
                            Directions
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>
        )}

      </div>
      
      <PlaceDetailsModal 
        placeId={selectedPlaceId} 
        onClose={() => setSelectedPlaceId(null)} 
      />
    </div>
  );
}