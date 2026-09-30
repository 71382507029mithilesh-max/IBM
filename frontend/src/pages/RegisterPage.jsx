import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = ({ onRegisterSuccess, onGoToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await register({
        name,
        email,
        phone,
        password,
        confirm_password: confirmPassword
      });

      if (res.success) {
        onRegisterSuccess();
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection failure. Check if the Flask backend is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '50px 24px', maxWidth: '520px' }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        padding: '36px 30px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            background: '#ECFDF5',
            color: '#10B981',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            marginBottom: '12px'
          }}>
            <i className="fa-solid fa-user-plus"></i>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>Create Your Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join StayEase to reserve verified hotels with immediate confirmation.</p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.85rem' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Full Name *
            </label>
            <input 
              type="text" 
              className="search-input"
              style={{ paddingLeft: '14px' }}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Alex Morgan"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Email Address *
              </label>
              <input 
                type="email" 
                className="search-input"
                style={{ paddingLeft: '14px' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@example.com"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Phone Number *
              </label>
              <input 
                type="tel" 
                className="search-input"
                style={{ paddingLeft: '14px' }}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1-555-0144"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Password *
              </label>
              <input 
                type="password" 
                className="search-input"
                style={{ paddingLeft: '14px' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Confirm Password *
              </label>
              <input 
                type="password" 
                className="search-input"
                style={{ paddingLeft: '14px' }}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: '10px' }}>
            {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Creating Account...</> : 'Complete Registration'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button onClick={onGoToLogin} style={{ color: 'var(--accent)', fontWeight: 700 }}>
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
