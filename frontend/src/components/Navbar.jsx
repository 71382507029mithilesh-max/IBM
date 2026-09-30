import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Navbar = ({ currentView, setView }) => {
  const { user, logout, isAdmin } = useAuth();
  const [infraStatus, setInfraStatus] = useState({ healthy: true, engine: 'online' });

  useEffect(() => {
    const checkInfra = async () => {
      try {
        const data = await api.getHealth();
        setInfraStatus({ healthy: data.status === 'healthy', engine: data.engine || 'active' });
      } catch (e) {
        setInfraStatus({ healthy: false, engine: 'unreachable' });
      }
    };
    checkInfra();
    const interval = setInterval(checkInfra, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="navbar">
      <div className="container nav-container">
        <a href="#home" onClick={() => setView('home')} className="brand-logo">
          <span className="brand-badge"><i className="fa-solid fa-hotel"></i></span>
          StayEase
        </a>

        <ul className="nav-links">
          <li>
            <button 
              onClick={() => setView('home')} 
              className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-house"></i> Home
            </button>
          </li>
          <li>
            <button 
              onClick={() => setView('hotels')} 
              className={`nav-link ${currentView === 'hotels' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-compass"></i> Hotels
            </button>
          </li>
          {user && (
            <li>
              <button 
                onClick={() => setView('my-bookings')} 
                className={`nav-link ${currentView === 'my-bookings' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-receipt"></i> My Bookings
              </button>
            </li>
          )}
          {isAdmin && (
            <li>
              <button 
                onClick={() => setView('admin')} 
                className={`nav-link ${currentView === 'admin' ? 'active' : ''}`}
                style={{ color: '#D97706', fontWeight: 700 }}
              >
                <i className="fa-solid fa-chart-line"></i> Admin Dashboard
              </button>
            </li>
          )}
        </ul>

        <div className="nav-auth">
          {/* Infrastructure Health Status Indicator */}
          <div 
            className="infra-badge" 
            title="Monitored via Prometheus & Health Check"
            style={{ 
              borderColor: infraStatus.healthy ? '#A7F3D0' : '#FECACA',
              background: infraStatus.healthy ? '#ECFDF5' : '#FEF2F2',
              color: infraStatus.healthy ? '#059669' : '#DC2626'
            }}
          >
            <span 
              className="infra-badge-pulse"
              style={{ background: infraStatus.healthy ? '#10B981' : '#EF4444' }}
            ></span>
            <span>API: {infraStatus.healthy ? 'HEALTHY' : 'DEGRADED'} ({infraStatus.engine.toUpperCase()})</span>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                <i className="fa-regular fa-user" style={{ marginRight: '6px', color: 'var(--accent)' }}></i>
                {user.name.split(' ')[0]} {isAdmin ? <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>ADMIN</span> : <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>GUEST</span>}
              </span>
              <button onClick={logout} className="btn btn-secondary btn-sm" title="Log Out">
                <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setView('login', 'user')} className="btn btn-secondary btn-sm">
                <i className="fa-solid fa-user" style={{ color: 'var(--accent)' }}></i> User Login
              </button>
              <button onClick={() => setView('login', 'admin')} className="btn btn-sm" style={{ background: 'linear-gradient(135deg, #B45309 0%, #D97706 100%)', color: 'white' }}>
                <i className="fa-solid fa-shield-halved"></i> Admin Login
              </button>
              <button onClick={() => setView('register')} className="btn btn-outline btn-sm">
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
