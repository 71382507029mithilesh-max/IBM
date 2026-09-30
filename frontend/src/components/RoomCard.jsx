import React from 'react';

export const RoomCard = ({ room, onSelectRoom }) => {
  return (
    <div className="room-card">
      <div style={{ position: 'relative', height: '100%', minHeight: '190px' }}>
        <img 
          src={room.image} 
          alt={room.room_type} 
          className="room-image" 
          loading="lazy"
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          {room.availability ? (
            <span className="badge badge-success"><i className="fa-solid fa-circle-check"></i> Available</span>
          ) : (
            <span className="badge badge-danger"><i className="fa-solid fa-circle-xmark"></i> Reserved</span>
          )}
        </div>
      </div>

      <div className="room-details">
        <h4 className="room-title">{room.room_type}</h4>
        
        <div className="room-meta">
          <span className="room-meta-item">
            <i className="fa-solid fa-user-group" style={{ color: 'var(--accent)' }}></i>
            Max {room.capacity} Guests
          </span>
          <span className="room-meta-item">
            <i className="fa-solid fa-bed" style={{ color: 'var(--accent)' }}></i>
            {room.bed_type}
          </span>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
          {room.description}
        </p>

        <div className="facility-chips" style={{ marginBottom: 0 }}>
          {(room.facilities_list || []).map((f, i) => (
            <span key={i} className="facility-chip">
              <i className="fa-solid fa-check" style={{ fontSize: '0.65rem', marginRight: '4px', color: '#10B981' }}></i>
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="room-pricing">
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Rate</span>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary)' }}>
            ₹{Number(room.price).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>per night</span>
        </div>

        <button 
          onClick={() => onSelectRoom(room)} 
          disabled={!room.availability}
          className={`btn ${room.availability ? 'btn-primary' : 'btn-secondary'} btn-md`}
          style={{ width: '100%' }}
        >
          {room.availability ? (
            <>
              <i className="fa-solid fa-calendar-check"></i> Book Room
            </>
          ) : 'Sold Out'}
        </button>
      </div>
    </div>
  );
};
