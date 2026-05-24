import { X, Star, Clock, Phone, Users, Image as ImageIcon, Tag, Calendar, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

export default function PlaceDetailsModal({ placeId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(null);

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      setDetails(null);
      try {
        const res = await fetch(`http://localhost:5000/places/details?place_id=${placeId}`);
        const data = await res.json();
        setDetails(data.result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (placeId) {
      fetchDetails();
      setActivePhoto(null);
    } else {
      setDetails(null);
      setActivePhoto(null);
    }
  }, [placeId]);

  if (!placeId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        {loading ? (
          <div className="modal-loading">Loading details...</div>
        ) : !details ? (
          <div className="modal-error">Failed to load details.</div>
        ) : (
          <>
            {details.photos && details.photos.length > 0 && (
              <div className="modal-hero" onClick={() => setActivePhoto(details.photos[0].photo_reference)}>
                <img 
                  src={`http://localhost:5000/places/photo?photo_reference=${details.photos[0].photo_reference}`} 
                  alt={details.name} 
                />
                <div className="modal-hero-overlay"></div>
              </div>
            )}

            <div className="modal-body">
              <h2>{details.name}</h2>
              
              <div className="modal-meta">
                {details.rating && (
                  <span className="modal-rating">
                    Rating: {details.rating}
                  </span>
                )}
                {details.opening_hours && (
                  <span className={`modal-status ${details.opening_hours.open_now ? "open" : "closed"}`}>
                    <Clock size={16} /> {details.opening_hours.open_now ? "Open Now" : "Closed"}
                  </span>
                )}
              </div>

              {(details.offer || details.event) && (
                <div className="place-badges" style={{ marginBottom: '24px' }}>
                  {details.offer && <span className="offer-badge" style={{ fontSize: '1rem', padding: '8px 16px' }}><Tag size={16}/> {details.offer}</span>}
                  {details.event && <span className="event-badge" style={{ fontSize: '1rem', padding: '8px 16px' }}><Calendar size={16}/> {details.event}</span>}
                </div>
              )}

              <div className="modal-contact" style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {details.formatted_address && (
                  <p className="modal-address" style={{ margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '10px', fontWeight: '500', fontSize: '1.1rem', lineHeight: '1.4' }}>
                    <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> {details.formatted_address}
                  </p>
                )}
                {details.formatted_phone_number && (
                  <p className="modal-phone" style={{ margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500', fontSize: '1.1rem' }}>
                    <Phone size={18} style={{ flexShrink: 0 }} /> {details.formatted_phone_number}
                  </p>
                )}
              </div>

              <div className="modal-crowd">
                <h4><Users size={16} /> Estimated Crowd Level</h4>
                <div className="crowd-bar-bg">
                  <div 
                    className="crowd-bar-fill" 
                    style={{ width: `${details.mock_crowd_level || 30}%`, background: (details.mock_crowd_level > 70 ? "#ef4444" : details.mock_crowd_level > 40 ? "#f59e0b" : "#10b981") }}
                  ></div>
                </div>
                <small>{details.mock_crowd_level}% busy right now</small>
              </div>

              {details.photos && details.photos.length > 0 && (
                <div className="modal-photos">
                  <h4>Photos</h4>
                  <div className="photo-grid">
                    {details.photos.map((photo, idx) => (
                      <div 
                        key={idx} 
                        className="photo-item"
                        onClick={() => setActivePhoto(photo.photo_reference)}
                      >
                        <img 
                          src={`http://localhost:5000/places/photo?photo_reference=${photo.photo_reference}`} 
                          alt={`${details.name} ${idx + 1}`}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {details.reviews && details.reviews.length > 0 && (
                <div className="modal-reviews">
                  <h4>Recent Reviews</h4>
                  {details.reviews.slice(0, 3).map((rev, i) => (
                    <div key={i} className="review-item">
                      <div className="review-header">
                        <strong>{rev.author_name}</strong>
                        <span className="review-rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={14} fill="#f59e0b" color="#f59e0b" /> {rev.rating}
                        </span>
                      </div>
                      <p>{rev.text}</p>
                      <small>{rev.relative_time_description}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {activePhoto && (
        <div className="lightbox-overlay" onClick={() => setActivePhoto(null)}>
          <button className="lightbox-close" onClick={() => setActivePhoto(null)}>
            <X size={28} />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={`http://localhost:5000/places/photo?photo_reference=${activePhoto}`} 
              alt="Enlarged view" 
              className="lightbox-image"
            />
          </div>
        </div>
      )}
    </div>
  );
}
