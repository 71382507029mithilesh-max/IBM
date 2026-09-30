import React from 'react';
import { SearchBar } from '../components/SearchBar';
import { HotelCard } from '../components/HotelCard';

export const HomePage = ({ hotels, onSearch, onViewHotel, onQuickBook, setView }) => {
  const featuredHotels = hotels.slice(0, 3);

  const destinations = [
    { name: 'Goa', count: 'Mobor & Calangute Beach', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80' },
    { name: 'Mumbai', count: 'Colaba & Arabian Sea', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80' },
    { name: 'Udaipur', count: 'Lake Pichola Palaces', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80' },
    { name: 'Kerala', count: 'Vembanad Backwaters', img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=600&q=80' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-tag">
            <i className="fa-solid fa-gem" style={{ color: '#FBBF24' }}></i>
            Luxury Indian Stays &bull; 99.99% Availability
          </div>
          <h1>Experience India's Finest Luxury Stays</h1>
          <p>Book authentic heritage palaces, serene backwaters, and pristine beach sanctuaries across India.</p>
        </div>
      </section>

      {/* Search Interface */}
      <div className="container" style={{ position: 'relative', zIndex: 20 }}>
        <SearchBar onSearch={onSearch} />
      </div>

      {/* Cloud Architecture Showcase Banner */}
      <section className="container" style={{ marginTop: '50px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: '16px',
          padding: '24px 30px',
          color: 'white',
          border: '1px solid #334155',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '6px' }}>
              <i className="fa-solid fa-server"></i> Automated Cloud Topology
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>
              Terraform IaC &bull; Ansible Config &bull; AWS Load Balancer &bull; Prometheus
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: '680px' }}>
              The booking system runs on self-healing, multi-node compute with real-time metrics scraping, automated scaling triggers, and container health verification.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <a 
              href="/metrics" 
              target="_blank" 
              className="btn btn-outline btn-sm"
              style={{ borderColor: '#38BDF8', color: '#38BDF8' }}
            >
              <i className="fa-solid fa-chart-line"></i> Prometheus Metrics
            </a>
            <a 
              href="/health" 
              target="_blank" 
              className="btn btn-outline btn-sm"
              style={{ borderColor: '#34D399', color: '#34D399' }}
            >
              <i className="fa-solid fa-heart-pulse"></i> Health Endpoint
            </a>
          </div>
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Indian Luxury Retreats & Palaces</h2>
            <p className="section-subtitle">Hand-picked iconic destinations across India offering royal hospitality and timeless luxury.</p>
          </div>
          <button onClick={() => setView('hotels')} className="btn btn-outline btn-sm">
            View All Hotels ({hotels.length}) <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        <div className="hotel-grid">
          {featuredHotels.map(h => (
            <HotelCard 
              key={h.id} 
              hotel={h} 
              onViewDetails={onViewHotel}
              onBookNow={onQuickBook}
            />
          ))}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="section" style={{ background: '#F1F5F9' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Popular Destinations</h2>
              <p className="section-subtitle">Explore iconic getaways favored by global travelers.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {destinations.map((d, idx) => (
              <div 
                key={idx}
                onClick={() => onSearch({ location: d.name.split(',')[0] })}
                style={{
                  position: 'relative',
                  height: '240px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <img src={d.img} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 60%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '20px',
                  color: 'white'
                }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{d.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>{d.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
          <h2 className="section-title">Why Choose StayEase</h2>
          <p className="section-subtitle">Engineered for travelers seeking seamless reservations and maximum peace of mind.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '28px' }}>
          {[
            { icon: 'fa-solid fa-bolt', title: 'Easy Booking', desc: 'Confirm your dream reservation in under 60 seconds with intuitive room selectors.' },
            { icon: 'fa-solid fa-shield-check', title: 'Secure Booking', desc: 'Enterprise-grade encryption and tokenized transactions protect your privacy.' },
            { icon: 'fa-solid fa-bed', title: 'Best Available Rooms', desc: 'Direct hotel inventory synchronization guarantees transparent, competitive rates.' },
            { icon: 'fa-solid fa-headset', title: 'Reliable Service', desc: 'Backed by automated multi-server infrastructure and 24/7 proactive health monitoring.' }
          ].map((item, idx) => (
            <div 
              key={idx} 
              style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '30px 24px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition)'
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                background: '#EFF6FF',
                color: 'var(--accent)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                margin: '0 auto 18px'
              }}>
                <i className={item.icon}></i>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--primary)' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
