import React, { useState } from 'react';
import { api } from '../services/api';

export const PaymentModal = ({ booking, pricing, onClose, onPaymentSuccess }) => {
  const [method, setMethod] = useState('Credit/Debit Card');
  const [cardNumber, setCardNumber] = useState('4532 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [upiId, setUpiId] = useState('guest@oksbi');
  const [selectedBank, setSelectedBank] = useState('Chase Bank');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // Simulate real-world network latency (1.2s)
      await new Promise(r => setTimeout(r, 1200));

      const res = await api.processPayment({
        booking_id: booking.id,
        payment_method: method,
        amount: booking.total_amount || pricing.total
      });

      if (res.success) {
        onPaymentSuccess({
          ...booking,
          payment: res.payment,
          transaction_reference: res.transaction_reference,
          status: 'Confirmed'
        });
      } else {
        setError(res.message || 'Payment simulation failed.');
      }
    } catch (err) {
      setError('Payment gateway communication error.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '4px' }}>
              <i className="fa-solid fa-lock" style={{ color: '#10B981', marginRight: '6px' }}></i> Simulated Payment Gateway
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Academic Demo Environment &bull; No Real Money Charged</p>
          </div>
          <button onClick={onClose} style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handlePay}>
          <div className="modal-body">
            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </div>
            )}

            {/* Payable Summary Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#1E40AF', textTransform: 'uppercase', fontWeight: 700 }}>Total Payable</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E3A8A' }}>
                  ₹{Number(booking.total_amount || pricing.total).toLocaleString('en-IN')}
                </div>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>Ref: {booking.booking_id}</span>
            </div>

            {/* Payment Method Selector */}
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
              Choose Payment Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {[
                { id: 'Credit/Debit Card', icon: 'fa-solid fa-credit-card', label: 'Cards' },
                { id: 'UPI', icon: 'fa-solid fa-mobile-screen-button', label: 'UPI' },
                { id: 'Net Banking', icon: 'fa-solid fa-building-columns', label: 'Net Banking' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMethod(opt.id)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '8px',
                    border: method === opt.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: method === opt.id ? '#EFF6FF' : 'white',
                    color: method === opt.id ? 'var(--accent)' : 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className={opt.icon} style={{ fontSize: '1.1rem' }}></i>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Method Details */}
            {method === 'Credit/Debit Card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Demo Card Number</label>
                  <input type="text" className="search-input" value={cardNumber} onChange={e => setCardNumber(e.target.value)} style={{ paddingLeft: '14px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Expiry</label>
                    <input type="text" className="search-input" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} style={{ paddingLeft: '14px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CVV</label>
                    <input type="password" className="search-input" value={cardCvv} onChange={e => setCardCvv(e.target.value)} style={{ paddingLeft: '14px' }} />
                  </div>
                </div>
              </div>
            )}

            {method === 'UPI' && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Virtual Payment Address (VPA / UPI ID)</label>
                <input type="text" className="search-input" value={upiId} onChange={e => setUpiId(e.target.value)} style={{ paddingLeft: '14px' }} placeholder="username@okhdfcbank" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Supports Google Pay, PhonePe, Paytm, BHIM simulation.</span>
              </div>
            )}

            {method === 'Net Banking' && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Select Bank</label>
                <select className="search-input" value={selectedBank} onChange={e => setSelectedBank(e.target.value)} style={{ paddingLeft: '14px' }}>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="btn btn-primary" style={{ minWidth: '170px' }}>
              {processing ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Processing...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i> Authorize & Pay
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
