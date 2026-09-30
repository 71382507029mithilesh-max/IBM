import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

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

export const BookingModal = ({ hotel, room, initialDates, onClose, onBookingSuccess }) => {
  const { user } = useAuth();
  const today = getTodayStr();
  const [checkIn, setCheckIn] = useState(initialDates?.check_in && initialDates.check_in >= today ? initialDates.check_in : today);
  const [checkOut, setCheckOut] = useState(initialDates?.check_out && initialDates.check_out > checkIn ? initialDates.check_out : getFutureStr(3));
  const [guests, setGuests] = useState(initialDates?.guests || 2);
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCheckInChange = (newVal) => {
    setCheckIn(newVal);
    if (checkOut <= newVal) {
      setCheckOut(getTomorrowStr(newVal));
    }
  };

  // Calculate nights and pricing
  const calculateTotal = () => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = d2 - d1;
      const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const rate = Number(room.price);
      const subtotal = rate * nights;
      const taxes = Math.round(subtotal * 0.12 * 100) / 100;
      const total = Math.round((subtotal + taxes) * 100) / 100;
      return { nights, rate, subtotal, taxes, total };
    } catch {
      return { nights: 1, rate: Number(room.price), subtotal: Number(room.price), taxes: 0, total: Number(room.price) };
    }
  };

  const pricing = calculateTotal();

  const handleProceed = async (e) => {
    e.preventDefault();
    if (checkIn < today) {
      setError('Check-in date cannot be in the past (yesterday or earlier). Please select today or a future date.');
      return;
    }
    if (checkOut <= checkIn) {
      setError('Check-out date must be at least 1 day after check-in date.');
      return;
    }
    if (!guestName || !guestEmail || !guestPhone) {
      setError('Please provide complete guest contact information.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.createBooking({
        hotel_id: hotel.id,
        room_id: room.id,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        special_requests: specialRequests
      });

      if (res.success) {
        onBookingSuccess(res.booking, pricing);
      } else {
        setError(res.message || 'Unable to confirm booking. Please try again.');
      }
    } catch (err) {
      setError('Connection failure. Check if backend is active.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '4px' }}>Complete Your Reservation</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{hotel.name} &bull; {room.room_type}</p>
          </div>
          <button onClick={onClose} style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleProceed}>
          <div className="modal-body">
            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i> {error}
              </div>
            )}

            {/* Reservation Summary */}
            <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
                <i className="fa-solid fa-receipt" style={{ color: 'var(--accent)', marginRight: '6px' }}></i> Rate & Stay Breakdown
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ fontWeight: 600, color: 'var(--text-muted)', display: 'block' }}>Check-In</label>
                  <input type="date" min={today} value={checkIn} onChange={(e) => handleCheckInChange(e.target.value)} required style={{ width: '100%', padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 600, color: 'var(--text-muted)', display: 'block' }}>Check-Out</label>
                  <input type="date" min={getTomorrowStr(checkIn || today)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required style={{ width: '100%', padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                <span>₹{Number(pricing.rate).toLocaleString('en-IN')} &times; {pricing.nights} night(s)</span>
                <span>₹{Number(pricing.subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                <span>Estimated GST & Luxury Hotel Taxes (12%)</span>
                <span>₹{Number(pricing.taxes).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', borderTop: '1px dashed #CBD5E1', paddingTop: '10px', marginTop: '10px' }}>
                <span>Total Payable Amount</span>
                <span style={{ color: 'var(--accent)' }}>₹{Number(pricing.total).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Guest Details */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
              <i className="fa-solid fa-user-pen" style={{ color: 'var(--accent)', marginRight: '6px' }}></i> Guest Contact Information
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                <input type="text" className="search-input" value={guestName} onChange={(e) => setGuestName(e.target.value)} required style={{ paddingLeft: '14px' }} placeholder="Alex Morgan" />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email Address *</label>
                <input type="email" className="search-input" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required style={{ paddingLeft: '14px' }} placeholder="alex@example.com" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone Number (India) *</label>
                <input type="tel" className="search-input" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required style={{ paddingLeft: '14px' }} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Total Guests</label>
                <select className="search-input" value={guests} onChange={(e) => setGuests(parseInt(e.target.value))} style={{ paddingLeft: '14px' }}>
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4 Guests</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Special Requests (Optional)</label>
              <textarea 
                rows="2" 
                className="search-input" 
                style={{ paddingLeft: '14px', resize: 'vertical' }} 
                placeholder="Early check-in, high floor, quiet room..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Reserving...' : `Proceed to Payment (₹${Number(pricing.total).toLocaleString('en-IN')})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
