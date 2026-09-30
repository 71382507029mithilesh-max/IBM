import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const MyBookingsPage = ({ onSelectBooking, onBrowseHotels }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getBookings();
      if (res.success) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.error("Failed to load user bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }
    setCancellingId(bookingId);
    try {
      const res = await api.cancelBooking(bookingId);
      if (res.success) {
        setMessage('Reservation cancelled successfully.');
        fetchBookings();
      } else {
        alert(res.message || 'Unable to cancel booking.');
      }
    } catch (err) {
      alert('Error communicating with cancellation service.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="badge badge-success"><i className="fa-solid fa-circle-check"></i> Confirmed</span>;
      case 'Completed':
        return <span className="badge badge-info"><i className="fa-solid fa-circle-check"></i> Completed</span>;
      case 'Cancelled':
        return <span className="badge badge-danger"><i className="fa-solid fa-circle-xmark"></i> Cancelled</span>;
      default:
        return <span className="badge badge-warning">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>My Reservations</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your active hotel bookings, cancellations, and receipt records.</p>
        </div>

        <button onClick={onBrowseHotels} className="btn btn-primary btn-sm">
          <i className="fa-solid fa-plus"></i> Book Another Stay
        </button>
      </div>

      {message && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i> {message}</span>
          <button onClick={() => setMessage('')} style={{ color: '#065F46', fontWeight: 700 }}>&times;</button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--accent)', marginBottom: '14px' }}></i>
          <p style={{ color: 'var(--text-muted)' }}>Loading your booking history...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ background: 'white', padding: '60px 30px', textAlign: 'center', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <i className="fa-solid fa-receipt" style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '16px' }}></i>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '8px' }}>No Bookings Found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>You haven't reserved any hotel rooms yet.</p>
          <button onClick={onBrowseHotels} className="btn btn-primary">
            Explore Hotels Now
          </button>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Hotel & Destination</th>
                <th>Room Type</th>
                <th>Dates</th>
                <th>Guests</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>
                    <strong style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>{b.booking_id}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {b.booking_date ? b.booking_date.split(' ')[0] : 'Recent'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{b.hotel_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.hotel_location}</div>
                  </td>
                  <td>
                    <span>{b.room_type}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}><strong>In:</strong> {b.check_in}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><strong>Out:</strong> {b.check_out}</div>
                  </td>
                  <td>{b.guests}</td>
                  <td>
                    <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>
                      ₹{Number(b.total_amount).toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td>{getStatusBadge(b.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        onClick={() => onSelectBooking(b)} 
                        className="btn btn-secondary btn-sm"
                        title="View details & receipt"
                      >
                        View
                      </button>
                      {b.status === 'Confirmed' && (
                        <button 
                          onClick={() => handleCancel(b.id)} 
                          disabled={cancellingId === b.id}
                          className="btn btn-danger btn-sm"
                          title="Cancel reservation"
                        >
                          {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
