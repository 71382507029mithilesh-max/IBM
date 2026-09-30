import React, { useState } from 'react';

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getTomorrowStr = (base) => {
  const d = base ? new Date(base) : new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};
const getFutureStr = (days = 3) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const SearchBar = ({ onSearch, initialValues = {} }) => {
  const [location, setLocation] = useState(initialValues.location || '');
  const [checkIn, setCheckIn] = useState(initialValues.check_in || getTodayStr());
  const [checkOut, setCheckOut] = useState(initialValues.check_out || getFutureStr(3));
  const [guests, setGuests] = useState(initialValues.guests || 2);

  const handleCheckInChange = (newVal) => {
    setCheckIn(newVal);
    if (checkOut <= newVal) {
      setCheckOut(getTomorrowStr(newVal));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      location,
      check_in: checkIn,
      check_out: checkOut,
      guests
    });
  };

  return (
    <div className="search-card">
      <form onSubmit={handleSubmit} className="search-grid">
        <div className="search-field">
          <label className="search-label">
            <i className="fa-solid fa-location-dot"></i> Destination / Hotel
          </label>
          <div className="search-input-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="e.g. Goa, Mumbai, Udaipur, Kerala, Jaipur..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="search-field">
          <label className="search-label">
            <i className="fa-regular fa-calendar-check"></i> Check-In
          </label>
          <div className="search-input-wrap">
            <i className="fa-regular fa-calendar search-icon"></i>
            <input
              type="date"
              className="search-input"
              min={getTodayStr()}
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="search-field">
          <label className="search-label">
            <i className="fa-regular fa-calendar-xmark"></i> Check-Out
          </label>
          <div className="search-input-wrap">
            <i className="fa-regular fa-calendar search-icon"></i>
            <input
              type="date"
              className="search-input"
              min={getTomorrowStr(checkIn || getTodayStr())}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="search-field">
          <label className="search-label">
            <i className="fa-solid fa-user-group"></i> Guests
          </label>
          <div className="search-input-wrap">
            <i className="fa-solid fa-user search-icon"></i>
            <select
              className="search-input"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
            >
              <option value={1}>1 Guest</option>
              <option value={2}>2 Guests</option>
              <option value={3}>3 Guests</option>
              <option value={4}>4+ Guests</option>
            </select>
          </div>
        </div>

        <div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            <i className="fa-solid fa-magnifying-glass"></i> Search Hotels
          </button>
        </div>
      </form>
    </div>
  );
};
