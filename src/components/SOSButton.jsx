import { useState } from "react";
import { ShieldAlert, X, Phone, MapPin } from "lucide-react";

export default function SOSButton({ userLocation }) {
  const [isOpen, setIsOpen] = useState(false);
  const [emergencyPlaces, setEmergencyPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSOSClick = async () => {
    setIsOpen(true);
    setLoading(true);

    const performSOS = async (lat, lng) => {
      try {
        const res = await fetch(`http://localhost:5000/places/sos?lat=${lat}&lng=${lng}`);
        const data = await res.json();
        setEmergencyPlaces(data.places || []);
      } catch (err) {
        console.error("SOS fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation) {
      await performSOS(userLocation[0], userLocation[1]);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => performSOS(pos.coords.latitude, pos.coords.longitude),
        () => setLoading(false)
      );
    }
  };

  return (
    <>
      <button className="sos-button" onClick={handleSOSClick} title="Emergency Help">
        <ShieldAlert size={28} color="white" />
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="sos-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sos-header">
              <h3><ShieldAlert color="#ef4444" /> Emergency Assistance</h3>
              <button className="modal-close" onClick={() => setIsOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="sos-body">
              <div className="emergency-numbers">
                <h4>Quick Dial</h4>
                <div className="dial-buttons">
                  <a href="tel:911" className="dial-btn police"><Phone size={16}/> Police (911)</a>
                  <a href="tel:911" className="dial-btn ambulance"><Phone size={16}/> Ambulance</a>
                </div>
              </div>

              <div className="nearby-hospitals">
                <h4>Nearby Hospitals</h4>
                {loading ? (
                  <p>Finding nearest hospitals...</p>
                ) : emergencyPlaces.length > 0 ? (
                  <ul className="sos-places-list">
                    {emergencyPlaces.map(place => (
                      <li key={place.id}>
                        <div>
                          <strong>{place.name}</strong>
                          <small>{place.vicinity}</small>
                        </div>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                          target="_blank" rel="noreferrer"
                          className="sos-nav-btn"
                        >
                          <MapPin size={16} /> Go
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hospitals found nearby or location not available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
