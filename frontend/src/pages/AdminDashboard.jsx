import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');

  // Modals for Adding Hotel & Room
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [hotelForm, setHotelForm] = useState({
    name: '', location: '', starting_price: '', rating: '4.8',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    description: '', facilities: 'Wi-Fi, Swimming pool, Restaurant, Air conditioning, Spa'
  });
  const [roomForm, setRoomForm] = useState({
    hotel_id: '', room_type: '', price: '', capacity: 2, bed_type: 'King Bed',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    description: '', facilities: 'Free Wi-Fi, Air Conditioning, Balcony, Mini Bar',
    availability: true
  });

  const [notification, setNotification] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, hotelsRes, roomsRes, bookingsRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getHotels(),
        api.getAllRooms(),
        api.getBookings({ status: bookingStatusFilter === 'All' ? undefined : bookingStatusFilter, search: bookingSearch || undefined })
      ]);

      if (dashRes.success) setDashboardData(dashRes);
      if (hotelsRes.success) setHotels(hotelsRes.hotels);
      if (roomsRes.success) setRooms(roomsRes.rooms);
      if (bookingsRes.success) setBookings(bookingsRes.bookings);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [bookingStatusFilter]);

  const handleSearchBookings = (e) => {
    e.preventDefault();
    loadData();
  };

  // Add Hotel Handler
  const handleCreateHotel = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createHotel(hotelForm);
      if (res.success) {
        setNotification('Hotel successfully added to inventory!');
        setShowAddHotelModal(false);
        setHotelForm({
          name: '', location: '', starting_price: '', rating: '4.8',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          description: '', facilities: 'Wi-Fi, Swimming pool, Restaurant, Air conditioning, Spa'
        });
        loadData();
      } else {
        alert(res.message || 'Failed to add hotel');
      }
    } catch (err) {
      alert('Error creating hotel');
    }
  };

  // Delete Hotel Handler
  const handleDeleteHotel = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel? All associated rooms and bookings will be deleted!")) {
      return;
    }
    try {
      const res = await api.deleteHotel(id);
      if (res.success) {
        setNotification('Hotel deleted successfully.');
        loadData();
      }
    } catch (err) {
      alert('Error deleting hotel');
    }
  };

  // Add Room Handler
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createRoom(roomForm);
      if (res.success) {
        setNotification('Room category successfully added!');
        setShowAddRoomModal(false);
        loadData();
      } else {
        alert(res.message || 'Failed to add room');
      }
    } catch (err) {
      alert('Error adding room');
    }
  };

  // Toggle Room Availability
  const handleToggleRoomAvailability = async (room) => {
    try {
      const res = await api.updateRoom(room.id, { availability: !room.availability });
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert('Error updating room availability');
    }
  };

  // Delete Room Handler
  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Delete this room category?")) return;
    try {
      const res = await api.deleteRoom(id);
      if (res.success) {
        setNotification('Room deleted.');
        loadData();
      }
    } catch (err) {
      alert('Error deleting room');
    }
  };

  // Change Booking Status
  const handleChangeBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        setNotification(`Booking ${bookingId} updated to ${newStatus}`);
        loadData();
      }
    } catch (err) {
      alert('Error updating booking status');
    }
  };

  const stats = dashboardData?.stats || {
    total_users: 3, total_hotels: 8, total_rooms: 17,
    total_bookings: 5, confirmed_bookings: 3, cancelled_bookings: 1,
    completed_bookings: 1, total_revenue: 3100.00
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <i className="fa-solid fa-gauge-high"></i> Administrative Control Center
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>Hotel Infrastructure & Operations</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/metrics" target="_blank" className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-chart-line"></i> Raw Metrics
          </a>
          <button onClick={loadData} className="btn btn-outline btn-sm">
            <i className="fa-solid fa-rotate"></i> Refresh
          </button>
        </div>
      </div>

      {notification && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <span><i className="fa-solid fa-circle-check"></i> {notification}</span>
          <button onClick={() => setNotification('')} style={{ fontWeight: 700 }}>&times;</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '32px', overflowX: 'auto' }}>
        {[
          { id: 'overview', icon: 'fa-solid fa-chart-pie', label: 'Analytics & KPIs' },
          { id: 'hotels', icon: 'fa-solid fa-hotel', label: `Hotels (${hotels.length})` },
          { id: 'rooms', icon: 'fa-solid fa-bed', label: `Rooms (${rooms.length})` },
          { id: 'bookings', icon: 'fa-solid fa-receipt', label: `Bookings (${bookings.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '3px solid var(--accent)' : '3px solid transparent',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <i className={tab.icon}></i> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Statistics Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#EFF6FF', color: 'var(--accent)' }}>
                <i className="fa-solid fa-indian-rupee-sign"></i>
              </div>
              <div>
                <div className="stat-val">₹{stats.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</div>
                <div className="stat-title">Total Revenue (INR)</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <div>
                <div className="stat-val">{stats.confirmed_bookings}</div>
                <div className="stat-title">Confirmed Bookings</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <i className="fa-solid fa-hotel"></i>
              </div>
              <div>
                <div className="stat-val">{stats.total_hotels}</div>
                <div className="stat-title">Total Hotels</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#F1F5F9', color: '#64748B' }}>
                <i className="fa-solid fa-door-open"></i>
              </div>
              <div>
                <div className="stat-val">{stats.total_rooms}</div>
                <div className="stat-title">Room Inventory</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FEE2E2', color: '#EF4444' }}>
                <i className="fa-solid fa-calendar-xmark"></i>
              </div>
              <div>
                <div className="stat-val">{stats.cancelled_bookings}</div>
                <div className="stat-title">Cancellations</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                <i className="fa-solid fa-users"></i>
              </div>
              <div>
                <div className="stat-val">{stats.total_users}</div>
                <div className="stat-title">Registered Users</div>
              </div>
            </div>
          </div>

          {/* Interactive Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '36px' }}>
            {/* Chart 1: Revenue by Hotel Bar Representation */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-chart-column" style={{ color: 'var(--accent)' }}></i> Bookings & Revenue by Hotel
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(dashboardData?.charts?.hotel_performance || []).slice(0, 5).map((item, idx) => {
                  const maxRev = 2000;
                  const percent = Math.min(100, Math.max(15, (item.total_revenue / maxRev) * 100));
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.hotel_name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>₹{Number(item.total_revenue).toLocaleString('en-IN')} ({item.bookings_count} bks)</span>
                      </div>
                      <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Status Breakdown Donut/Pills */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-chart-pie" style={{ color: '#10B981' }}></i> Booking Status Proportions
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {(dashboardData?.charts?.status_breakdown || []).map((s, idx) => {
                  const total = stats.total_bookings || 1;
                  const pct = Math.round((s.count / total) * 100);
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: s.color }}></span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.status}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                        {s.count} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: '#065F46' }}>
                <i className="fa-solid fa-circle-info"></i> High confirmation rate ({Math.round(((stats.confirmed_bookings + stats.completed_bookings) / (stats.total_bookings || 1)) * 100)}%) demonstrates low drop-off across simulated payment steps.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOTEL MANAGEMENT */}
      {activeTab === 'hotels' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Managed Hotels ({hotels.length})</h2>
            <button onClick={() => setShowAddHotelModal(true)} className="btn btn-primary btn-sm">
              <i className="fa-solid fa-plus"></i> Add New Hotel
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hotel Image</th>
                  <th>Name & Location</th>
                  <th>Rating</th>
                  <th>Starting Price</th>
                  <th>Facilities</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map(h => (
                  <tr key={h.id}>
                    <td style={{ width: '80px' }}>
                      <img src={h.image} alt={h.name} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{h.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{h.location}</div>
                    </td>
                    <td>
                      <span className="badge badge-warning">
                        <i className="fa-solid fa-star"></i> {Number(h.rating).toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>₹{Number(h.starting_price).toLocaleString('en-IN')}</strong> / night
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {(h.facilities_list || []).slice(0, 3).join(', ')}...
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteHotel(h.id)} 
                        className="btn btn-danger btn-sm"
                        title="Delete Hotel"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ROOM MANAGEMENT */}
      {activeTab === 'rooms' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Room Inventory ({rooms.length})</h2>
            <button onClick={() => setShowAddRoomModal(true)} className="btn btn-primary btn-sm">
              <i className="fa-solid fa-plus"></i> Add Room Category
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Room Image</th>
                  <th>Hotel Destination</th>
                  <th>Room Type</th>
                  <th>Capacity / Bed</th>
                  <th>Nightly Rate</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.id}>
                    <td style={{ width: '80px' }}>
                      <img src={r.image} alt={r.room_type} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>{r.hotel_name}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.room_type}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{r.capacity} Guests &bull; {r.bed_type}</div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--accent)', fontSize: '1rem' }}>₹{Number(r.price).toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleRoomAvailability(r)}
                        className={`badge ${r.availability ? 'badge-success' : 'badge-danger'}`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle availability"
                      >
                        {r.availability ? 'Available' : 'Reserved'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDeleteRoom(r.id)} className="btn btn-danger btn-sm">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BOOKING MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>All Reservations ({bookings.length})</h2>

            <div style={{ display: 'flex', gap: '10px' }}>
              <form onSubmit={handleSearchBookings} style={{ display: 'flex', gap: '6px' }}>
                <input 
                  type="text" 
                  placeholder="Search guest or code..." 
                  className="search-input"
                  style={{ padding: '6px 12px', width: '220px' }}
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary btn-sm">Search</button>
              </form>

              <select 
                value={bookingStatusFilter} 
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="search-input"
                style={{ padding: '6px 12px', width: 'auto' }}
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Guest Name & Contact</th>
                  <th>Hotel</th>
                  <th>Stay Dates</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ color: 'var(--accent)' }}>{b.booking_id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.guest_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.guest_email} &bull; {b.guest_phone}</div>
                    </td>
                    <td>
                      <div>{b.hotel_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{b.room_type}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {b.check_in} to {b.check_out}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>₹{Number(b.total_amount).toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <span className={`badge ${
                        b.status === 'Confirmed' ? 'badge-success' : b.status === 'Cancelled' ? 'badge-danger' : 'badge-info'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <select 
                        value={b.status} 
                        onChange={(e) => handleChangeBookingStatus(b.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Hotel */}
      {showAddHotelModal && (
        <div className="modal-overlay" onClick={() => setShowAddHotelModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Add New Hotel Property</h3>
              <button onClick={() => setShowAddHotelModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleCreateHotel}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Hotel Name *</label>
                  <input type="text" className="search-input" required value={hotelForm.name} onChange={e => setHotelForm({...hotelForm, name: e.target.value})} placeholder="e.g. The Ritz Panorama" style={{ paddingLeft: '12px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Location (City, State) *</label>
                    <input type="text" className="search-input" required value={hotelForm.location} onChange={e => setHotelForm({...hotelForm, location: e.target.value})} placeholder="e.g. Honolulu, Hawaii" style={{ paddingLeft: '12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Starting Price ($) *</label>
                    <input type="number" className="search-input" required value={hotelForm.starting_price} onChange={e => setHotelForm({...hotelForm, starting_price: e.target.value})} placeholder="240" style={{ paddingLeft: '12px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Featured Image URL *</label>
                  <input type="url" className="search-input" required value={hotelForm.image} onChange={e => setHotelForm({...hotelForm, image: e.target.value})} style={{ paddingLeft: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Facilities (comma separated)</label>
                  <input type="text" className="search-input" value={hotelForm.facilities} onChange={e => setHotelForm({...hotelForm, facilities: e.target.value})} style={{ paddingLeft: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Description</label>
                  <textarea rows="3" className="search-input" value={hotelForm.description} onChange={e => setHotelForm({...hotelForm, description: e.target.value})} placeholder="Captivating summary of hotel luxury..." style={{ paddingLeft: '12px', resize: 'vertical' }}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddHotelModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Hotel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Room */}
      {showAddRoomModal && (
        <div className="modal-overlay" onClick={() => setShowAddRoomModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Add Room Category</h3>
              <button onClick={() => setShowAddRoomModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleCreateRoom}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Select Hotel Property *</label>
                  <select 
                    className="search-input" 
                    required 
                    value={roomForm.hotel_id} 
                    onChange={e => setRoomForm({...roomForm, hotel_id: e.target.value})}
                    style={{ paddingLeft: '12px' }}
                  >
                    <option value="">-- Choose Hotel --</option>
                    {hotels.map(h => (
                      <option key={h.id} value={h.id}>{h.name} ({h.location})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Room Type / Name *</label>
                    <input type="text" className="search-input" required value={roomForm.room_type} onChange={e => setRoomForm({...roomForm, room_type: e.target.value})} placeholder="e.g. Signature Ocean Suite" style={{ paddingLeft: '12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Price per Night ($) *</label>
                    <input type="number" className="search-input" required value={roomForm.price} onChange={e => setRoomForm({...roomForm, price: e.target.value})} placeholder="290" style={{ paddingLeft: '12px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Max Guests</label>
                    <input type="number" min="1" max="10" className="search-input" value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: e.target.value})} style={{ paddingLeft: '12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Bed Type</label>
                    <input type="text" className="search-input" value={roomForm.bed_type} onChange={e => setRoomForm({...roomForm, bed_type: e.target.value})} placeholder="King Bed" style={{ paddingLeft: '12px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Room Image URL *</label>
                  <input type="url" className="search-input" required value={roomForm.image} onChange={e => setRoomForm({...roomForm, image: e.target.value})} style={{ paddingLeft: '12px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Room Description</label>
                  <textarea rows="2" className="search-input" value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})} placeholder="Key room perks and furnishings..." style={{ paddingLeft: '12px' }}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddRoomModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
