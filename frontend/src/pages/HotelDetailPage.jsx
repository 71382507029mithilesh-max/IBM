import React, { useState, useEffect } from 'react';
import { RoomCard } from '../components/RoomCard';
import { api } from '../services/api';

export const HotelDetailPage = ({ hotelId, onBack, onSelectRoom }) => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.getHotel(hotelId);
        if (res.success) {
          setHotel(res.hotel);
          setSelectedImage(res.hotel.image);
        }
      } catch (err) {
        console.error("Error fetching hotel details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [hotelId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '16px' }}></i>
        <p style={{ color: 'var(--text-muted)' }}>Loading hotel experience...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h3>Hotel record not found</h3>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '16px' }}>Back to Hotels</button>
      </div>
    );
  }

  const gallery = hotel.gallery && hotel.gallery.length > 0 ? hotel.gallery : [hotel.image];

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* Back button */}
      <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ marginBottom: '20px' }}>
        <i className="fa-solid fa-arrow-left"></i> Back to Hotel Listings
      </button>

      {/* Hotel Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px' }}>
            <i className="fa-solid fa-location-dot"></i> {hotel.location}
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: '1.2' }}>{hotel.name}</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#0F172A', color: 'white', padding: '8px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <i className="fa-solid fa-star" style={{ color: '#FBBF24' }}></i>
            <span style={{ fontSize: '1.2rem' }}>{Number(hotel.rating).toFixed(1)}</span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Interactive Photo Gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '40px', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ height: '420px' }}>
          <img 
            src={selectedImage || hotel.image} 
            alt={hotel.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
        <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: '16px', height: '420px' }}>
          {gallery.slice(0, 3).map((imgUrl, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedImage(imgUrl)}
              style={{
                cursor: 'pointer',
                borderRadius: '8px',
                overflow: 'hidden',
                border: selectedImage === imgUrl ? '3px solid var(--accent)' : 'none',
                opacity: selectedImage === imgUrl ? 1 : 0.75,
                transition: 'opacity 0.2s'
              }}
            >
              <img src={imgUrl} alt={`Thumbnail ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Description & Amenities Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', marginBottom: '60px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px' }}>About this Property</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '28px' }}>
            {hotel.description}
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px' }}>Property Amenities</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {(hotel.facilities_list || []).map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', color: 'var(--text-main)', background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#10B981' }}></i>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Booking Summary Card */}
        <div>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '96px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Starting Price</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{Number(hotel.starting_price).toLocaleString('en-IN')} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ night</span>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
              Select an available room category below to customize dates, guests, and finalize simulated reservation.
            </div>

            <a href="#available-rooms" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              <i className="fa-solid fa-arrow-down"></i> Choose a Room
            </a>
          </div>
        </div>
      </div>

      {/* Available Rooms Section */}
      <section id="available-rooms">
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>Available Rooms & Suites</h2>
          <p style={{ color: 'var(--text-muted)' }}>Transparent rates with no hidden booking fees.</p>
        </div>

        {hotel.rooms && hotel.rooms.length > 0 ? (
          <div>
            {hotel.rooms.map(room => (
              <RoomCard 
                key={room.id} 
                room={room} 
                onSelectRoom={() => onSelectRoom(hotel, room)}
              />
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No rooms currently available for this property.</p>
          </div>
        )}
      </section>
    </div>
  );
};
