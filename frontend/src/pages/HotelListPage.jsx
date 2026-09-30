import React, { useState, useEffect } from 'react';
import { HotelCard } from '../components/HotelCard';
import { api } from '../services/api';

export const HotelListPage = ({ initialFilters = {}, onViewHotel, onQuickBook }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(initialFilters.location || '');
  const [maxPrice, setMaxPrice] = useState(25000);
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  const facilityOptions = [
    'Wi-Fi', 'Swimming pool', 'Spa', 'Restaurant', 
    'Parking', 'Air conditioning', '24/7 reception', 'Golf Course'
  ];

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = {
        location: location || undefined,
        max_price: maxPrice || undefined,
        min_rating: minRating || undefined,
        sort_by: sortBy || undefined,
        facilities: selectedFacilities.length ? selectedFacilities.join(',') : undefined
      };
      const res = await api.getHotels(params);
      if (res.success) {
        setHotels(res.hotels);
      }
    } catch (err) {
      console.error("Error loading hotels:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [location, maxPrice, minRating, sortBy, selectedFacilities]);

  const toggleFacility = (fac) => {
    setSelectedFacilities(prev => 
      prev.includes(fac) ? prev.filter(f => f !== fac) : [...prev, fac]
    );
  };

  const handleResetFilters = () => {
    setLocation('');
    setMaxPrice(25000);
    setMinRating('');
    setSortBy('rating');
    setSelectedFacilities([]);
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>Available Hotels & Resorts</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Showing <strong>{hotels.length}</strong> verified luxury stays
            {location && <span> matching "<strong>{location}</strong>"</span>}
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sort By:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="search-input"
            style={{ padding: '8px 12px', width: 'auto', background: 'white' }}
          >
            <option value="rating">Highest Guest Rating</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="listing-layout">
        {/* Sidebar Filters */}
        <aside className="filter-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
              <i className="fa-solid fa-sliders" style={{ color: 'var(--accent)', marginRight: '6px' }}></i> Filters
            </h3>
            <button onClick={handleResetFilters} style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
              Reset All
            </button>
          </div>

          {/* Location Search Input */}
          <div className="filter-group">
            <label className="filter-title">Destination</label>
            <input 
              type="text" 
              className="search-input"
              style={{ paddingLeft: '12px' }}
              placeholder="Filter by city..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Price Range Slider */}
          <div className="filter-group">
            <div className="filter-title">
              <span>Max Price / Night</span>
              <span style={{ color: 'var(--accent)', fontWeight: 800 }}>₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min="3000" 
              max="25000" 
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
              <span>₹3,000</span>
              <span>₹25,000+</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="filter-group">
            <label className="filter-title">Guest Rating</label>
            {[
              { val: '', label: 'Any Rating' },
              { val: '4.8', label: '4.8+ Exceptional' },
              { val: '4.5', label: '4.5+ Wonderful' },
              { val: '4.0', label: '4.0+ Very Good' }
            ].map(r => (
              <label key={r.val} className="filter-checkbox-label">
                <input 
                  type="radio" 
                  name="rating" 
                  checked={minRating === r.val} 
                  onChange={() => setMinRating(r.val)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>

          {/* Facilities */}
          <div className="filter-group">
            <label className="filter-title">Popular Amenities</label>
            {facilityOptions.map(fac => (
              <label key={fac} className="filter-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={selectedFacilities.includes(fac)}
                  onChange={() => toggleFacility(fac)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span>{fac}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* Hotel Grid */}
        <main>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '16px' }}></i>
              <p style={{ color: 'var(--text-muted)' }}>Searching available properties across database...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '12px', padding: '50px 30px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <i className="fa-solid fa-hotel" style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '16px' }}></i>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '8px' }}>No Hotels Match Your Criteria</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Try widening your price range or clearing selected amenities filter.</p>
              <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="hotel-grid">
              {hotels.map(h => (
                <HotelCard 
                  key={h.id} 
                  hotel={h} 
                  onViewDetails={onViewHotel}
                  onBookNow={onQuickBook}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
