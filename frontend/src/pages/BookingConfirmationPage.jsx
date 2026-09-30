import React from 'react';

export const BookingConfirmationPage = ({ booking, onGoToBookings, onGoHome }) => {
  if (!booking) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h3>No active confirmation available</h3>
        <button onClick={onGoHome} className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '720px' }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}>
        {/* Success Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
          color: 'white',
          padding: '36px 30px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <i className="fa-solid fa-check"></i>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>Booking Confirmed Successfully!</h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
            A confirmation receipt has been simulated and saved to your account.
          </p>
        </div>

        {/* Booking Details Card */}
        <div style={{ padding: '32px 30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '14px 20px', borderRadius: '10px', marginBottom: '28px', border: '1px solid var(--border)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Reservation Reference ID</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px' }}>
                {booking.booking_id}
              </div>
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              <i className="fa-solid fa-circle-check"></i> {booking.status || 'Confirmed'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Hotel Destination</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>{booking.hotel_name || 'Selected Luxury Hotel'}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Reserved Room Type</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>{booking.room_type || 'Selected Suite'}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Primary Guest</span>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>{booking.guest_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{booking.guest_email} &bull; {booking.guest_phone}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Guest Capacity</span>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>{booking.guests} Guest(s)</div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Check-In Date</span>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>{booking.check_in}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Check-Out Date</span>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>{booking.check_out}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '20px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Total Paid via Simulated Payment</span>
              {booking.transaction_reference && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Txn: {booking.transaction_reference}</span>
              )}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
              ₹{Number(booking.total_amount).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={onGoToBookings} className="btn btn-primary" style={{ flex: 1 }}>
              <i className="fa-solid fa-receipt"></i> View in My Bookings
            </button>
            <button onClick={onGoHome} className="btn btn-secondary">
              <i className="fa-solid fa-house"></i> Home
            </button>
            <button onClick={() => window.print()} className="btn btn-outline">
              <i className="fa-solid fa-print"></i> Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
