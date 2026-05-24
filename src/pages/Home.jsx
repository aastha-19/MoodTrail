import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [mood, setMood] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFindPlaces = () => {
    if (!mood) {
      setError("Please select a mood to continue");
      return;
    }

    // Save to history
    const history = JSON.parse(localStorage.getItem("nearbyPlacesHistory") || "[]");
    const newEntry = { mood, time: new Date().toISOString() };
    localStorage.setItem("nearbyPlacesHistory", JSON.stringify([newEntry, ...history].slice(0, 10)));

    setError("");
    navigate(`/results?mood=${mood}`);
  };

  return (
    <div className="home-container">
      <div className="top-nav">
        <button onClick={() => navigate('/dashboard')} className="secondary-btn">
          View Dashboard
        </button>
      </div>

      <h1 className="home-title">
        What are you in the mood for today?
      </h1>

      <p className="home-subtitle">
        Choose your vibe and discover nearby places
      </p>

      <div className="mood-grid">
        {[
          { id: "work", icon: "/icons/work.png", label: "Work" },
          { id: "relax", icon: "/icons/relax.png", label: "Relax" },
          { id: "fun", icon: "/icons/fun.png", label: "Fun" },
          { id: "food", icon: "/icons/food.png", label: "Food" },
          { id: "date", icon: "/icons/date.png", label: "Date" },
          { id: "party", icon: "/icons/party.png", label: "Party" }
        ].map((m) => (
          <button
            key={m.id}
            className={`mood-pill ${mood === m.id ? "active" : ""}`}
            onClick={() => {
              setMood(m.id);
              setError("");
            }}
          >
            <span className="mood-icon">
              <img src={m.icon} alt={m.label} className="vibe-icon-img" />
            </span>
            <span className="mood-label">{m.label}</span>
          </button>
        ))}
      </div>

      {/* ❌ ERROR MESSAGE */}
      {error && <p className="error-text">{error}</p>}

      {/* ✅ BUTTON BELOW DROPDOWN */}
      <button
        className="primary-btn"
        onClick={handleFindPlaces}
        disabled={!mood}
      >
        Find Nearby Places
      </button>
    </div>
  );
}
