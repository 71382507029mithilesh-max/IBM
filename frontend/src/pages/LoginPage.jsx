import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ initialRole = 'user', onLoginSuccess, onGoToRegister }) => {
  const { login } = useAuth();
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState(initialRole === 'admin' ? 'admin@stayease.com' : 'alex.morgan@example.com');
  const [password, setPassword] = useState(initialRole === 'admin' ? 'admin123' : 'user123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When tab switches, update demo defaults
  const handleSelectRole = (newRole) => {
    setRole(newRole);
    setError('');
    if (newRole === 'admin') {
      setEmail('admin@stayease.com');
      setPassword('admin123');
    } else {
      setEmail('alex.morgan@example.com');
      setPassword('user123');
    }
  };

  useEffect(() => {
    if (initialRole) {
      handleSelectRole(initialRole);
    }
  }, [initialRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.success) {
        onLoginSuccess(res.user?.role || role);
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Connection failure. Check if the Flask backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '480px' }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        padding: '36px 30px'
      }}>
        {/* Two Explicit Login Options Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          <button 
            type="button" 
            onClick={() => handleSelectRole('user')} 
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: role === 'user' ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: role === 'user' ? '#EFF6FF' : '#F8FAFC',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: role === 'user' ? 'var(--accent)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <i className="fa-solid fa-user"></i> User Login
          </button>
          <button 
            type="button" 
            onClick={() => handleSelectRole('admin')} 
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: role === 'admin' ? '2px solid #D97706' : '1px solid var(--border)',
              background: role === 'admin' ? '#FEF3C7' : '#F8FAFC',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: role === 'admin' ? '#B45309' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <i className="fa-solid fa-shield-halved"></i> Admin Login
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            background: role === 'admin' ? '#FEF3C7' : '#EFF6FF',
            color: role === 'admin' ? '#D97706' : 'var(--accent)',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: '10px'
          }}>
            <i className={role === 'admin' ? 'fa-solid fa-shield-halved' : 'fa-solid fa-user'}></i>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
            {role === 'admin' ? 'Admin Portal Sign In' : 'Customer / User Sign In'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {role === 'admin' 
              ? 'Access the operations dashboard, Prometheus metrics, and Indian hotel inventory.' 
              : 'Browse Indian luxury hotels and manage your personal reservations.'}
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <input 
              type="email" 
              className="search-input"
              style={{ paddingLeft: '14px' }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={role === 'admin' ? 'admin@stayease.com' : 'alex.morgan@example.com'}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input 
              type="password" 
              className="search-input"
              style={{ paddingLeft: '14px' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-lg" 
            style={{ 
              marginTop: '8px',
              background: role === 'admin' ? 'linear-gradient(135deg, #B45309 0%, #D97706 100%)' : 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
              color: 'white'
            }}
          >
            {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Authenticating...</> : `Sign In as ${role === 'admin' ? 'Administrator' : 'Customer'}`}
          </button>
        </form>

        {/* Quick Academic Demo Buttons */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
            Quick 1-Click Credentials
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button 
              type="button"
              onClick={() => handleSelectRole('user')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              <i className="fa-solid fa-user"></i> User: alex.morgan
            </button>
            <button 
              type="button"
              onClick={() => handleSelectRole('admin')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', color: '#D97706' }}
            >
              <i className="fa-solid fa-shield-halved"></i> Admin: admin@
            </button>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button onClick={onGoToRegister} style={{ color: 'var(--accent)', fontWeight: 700 }}>
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
};
