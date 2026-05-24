import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Clock, Navigation } from "lucide-react";

export default function Dashboard() {
  const [wishlist, setWishlist] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("nearbyPlacesWishlist") || "[]");
    const savedHistory = JSON.parse(localStorage.getItem("nearbyPlacesHistory") || "[]");
    setWishlist(savedWishlist);
    setHistory(savedHistory);
  }, []);

  const removeFromWishlist = (id) => {
    const newWishlist = wishlist.filter(p => p.id !== id);
    setWishlist(newWishlist);
    localStorage.setItem("nearbyPlacesWishlist", JSON.stringify(newWishlist));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("nearbyPlacesHistory");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        <h1>Your Dashboard</h1>
      </div>

      <div className="dashboard-content">
        <section className="dashboard-section wishlist-section">
          <h2>Saved Places</h2>
          {wishlist.length === 0 ? (
            <p className="empty-text">Your wishlist is empty. Go find some cool places!</p>
          ) : (
            <div className="places-grid">
              {wishlist.map(place => (
                <div key={place.id} className="place-card-item">
                  <h3 className="place-name">{place.name}</h3>
                  <div className="dashboard-card-actions">
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                      target="_blank" rel="noreferrer"
                      className="directions-btn small"
                    >
                      <Navigation size={14} /> Go
                    </a>
                    <button onClick={() => removeFromWishlist(place.id)} className="remove-btn">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section history-section">
          <div className="section-header">
            <h2>Recent Searches</h2>
            {history.length > 0 && (
              <button onClick={clearHistory} className="clear-btn">Clear History</button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="empty-text">No recent searches yet.</p>
          ) : (
            <ul className="history-list">
              {history.map((item, idx) => (
                <li key={idx} className="history-item">
                  <Link to={`/results?mood=${item.mood}`}>
                    <div className="history-mood-container">
                      <span className="history-mood capitalize">{item.mood}</span> 
                      <span className="history-text">vibe</span>
                    </div>
                    <span className="history-time">{new Date(item.time).toLocaleString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
