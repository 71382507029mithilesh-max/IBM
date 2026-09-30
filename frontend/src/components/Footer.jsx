import React from 'react';

export const Footer = ({ setView }) => {
  return (
    <footer style={{ background: '#0A192F', color: '#94A3B8', padding: '60px 0 30px', marginTop: '60px', borderTop: '1px solid #1E293B' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '14px' }}>
              <span style={{ background: '#2563EB', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.9rem' }}>
                <i className="fa-solid fa-hotel"></i>
              </span>
              StayEase
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
              A next-generation hotel booking web platform engineered to demonstrate automated cloud infrastructure, CI/CD, load balancing, and observability.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}><i className="fa-brands fa-docker"></i> Docker Compose</span>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}><i className="fa-brands fa-aws"></i> AWS Cloud</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li><button onClick={() => setView('home')} style={{ color: '#94A3B8', hover: { color: 'white' } }}>Home</button></li>
              <li><button onClick={() => setView('hotels')} style={{ color: '#94A3B8' }}>Browse Hotels</button></li>
              <li><button onClick={() => setView('my-bookings')} style={{ color: '#94A3B8' }}>My Bookings</button></li>
              <li><button onClick={() => setView('admin')} style={{ color: '#94A3B8' }}>Admin Portal</button></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Infrastructure Stack</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <li><i className="fa-solid fa-cloud" style={{ color: '#38BDF8', width: '20px' }}></i> <strong>Terraform:</strong> VPC, Subnets, ALB, ASG</li>
              <li><i className="fa-solid fa-gears" style={{ color: '#F43F5E', width: '20px' }}></i> <strong>Ansible:</strong> Automated host configuration</li>
              <li><i className="fa-solid fa-box" style={{ color: '#3B82F6', width: '20px' }}></i> <strong>Docker:</strong> Containerized microservices</li>
              <li><i className="fa-solid fa-chart-simple" style={{ color: '#FB923C', width: '20px' }}></i> <strong>Prometheus:</strong> Metrics & alerts</li>
              <li><i className="fa-solid fa-gauge" style={{ color: '#FBBF24', width: '20px' }}></i> <strong>Grafana:</strong> Real-time infrastructure dashboard</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Academic Demonstration</h4>
            <div style={{ background: '#172A45', padding: '16px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #1E3A8A' }}>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: '6px' }}>Demo Credentials:</div>
              <div><strong style={{ color: '#93C5FD' }}>Customer:</strong> alex.morgan@example.com / user123</div>
              <div style={{ marginTop: '4px' }}><strong style={{ color: '#FCD34D' }}>Admin:</strong> admin@stayease.com / admin123</div>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#6EE7B7' }}>
                Health Check: <a href="/health" target="_blank" style={{ textDecoration: 'underline' }}>/health</a> | Metrics: <a href="/metrics" target="_blank" style={{ textDecoration: 'underline' }}>/metrics</a>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1E293B', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem' }}>
          <div>
            &copy; 2026 <strong>StayEase</strong> &mdash; Infrastructure Automation for Hotel Booking System. Academic Capstone Demonstration.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Auto-scaling Ready</span>
            <span>&bull;</span>
            <span>Zero Downtime Rolling Deployments</span>
            <span>&bull;</span>
            <span>MySQL 8.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
