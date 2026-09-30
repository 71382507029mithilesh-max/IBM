import React from 'react';

export const HotelCard = ({ hotel, onViewDetails, onBookNow }) => {
  return (
    <div className="hotel-card">
      <div className="hotel-image-wrap">
        <img 
          src={hotel.image} 
          alt={hotel.name} 
          className="hotel-image" 
          loading="lazy"
        />
        <div className="hotel-rating-badge">
          <i className="fa-solid fa-star"></i>
          <span>{Number(hotel.rating).toFixed(1)}</span>
        </div>
      </div>

      <div className="hotel-body">
        <div className="hotel-location">
          <i className="fa-solid fa-location-dot"></i>
          <span>{hotel.location}</span>
        </div>

        <h3 className="hotel-title">{hotel.name}</h3>

        <p className="hotel-desc">{hotel.description}</p>

        <div className="facility-chips">
          {(hotel.facilities_list || []).slice(0, 3).map((f, i) => (
            <span key={i} className="facility-chip">
              <i className="fa-solid fa-check" style={{ fontSize: '0.65rem', marginRight: '4px', color: '#10B981' }}></i>
              {f}
            </span>
          ))}
          {(hotel.facilities_list || []).length > 3 && (
            <span className="facility-chip" style={{ background: '#E2E8F0' }}>
              +{hotel.facilities_list.length - 3} more
            </span>
          )}
        </div>

        <div className="hotel-footer">
          <div className="hotel-price">
            <span className="hotel-price-label">Starting From</span>
            <span className="hotel-price-value">₹{Number(hotel.starting_price).toLocaleString('en-IN')}<span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-light)' }}> / night</span></span>
          </div>

          <div className="hotel-actions">
            <button 
              onClick={() => onViewDetails(hotel.id)} 
              className="btn btn-secondary btn-sm"
              title="View room types & gallery"
            >
              View Details
            </button>
            <button 
              onClick={() => onBookNow(hotel)} 
              className="btn btn-primary btn-sm"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
