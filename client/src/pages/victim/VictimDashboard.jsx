import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',      color: '#f39c12', bg: 'rgba(243,156,18,0.1)' },
  assigned:    { label: 'Assigned',     color: '#3498db', bg: 'rgba(52,152,219,0.1)' },
  on_the_way:  { label: 'On the Way',   color: '#9b59b6', bg: 'rgba(155,89,182,0.1)' },
  rescued:     { label: 'Rescued ✓',    color: '#2ecc71', bg: 'rgba(46,204,113,0.1)' },
  closed:      { label: 'Closed',       color: '#4a5260', bg: 'rgba(74,82,96,0.1)' },
};

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-base)' },
  topBar: {
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoIcon: { width: 36, height: 36, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' },
  topTitle: { fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.04em' },
  topSub: { fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace' },
  userChip: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: '20px', padding: '6px 14px 6px 8px',
    fontSize: '0.82rem', color: 'var(--text-secondary)',
  },
  userDot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' },
  logoutBtn: {
    background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    padding: '6px 12px', color: 'var(--text-muted)', fontSize: '0.8rem',
    fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em', cursor: 'pointer',
    transition: 'all var(--transition)',
  },
  content: { maxWidth: '820px', margin: '0 auto', padding: '36px 24px 60px', animation: 'fadeUp 0.4s ease both' },
  greeting: { marginBottom: '32px' },
  greetingTitle: { fontFamily: 'Oswald, sans-serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '4px' },
  greetingSub: { color: 'var(--text-secondary)', fontSize: '0.9rem' },
  sosCard: {
    background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px',
    marginBottom: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    boxShadow: '0 8px 32px rgba(230,57,70,0.3)',
    cursor: 'pointer',
    transition: 'transform var(--transition), box-shadow var(--transition)',
  },
  sosLeft: {},
  sosTitle: { fontFamily: 'Oswald, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: '4px' },
  sosDesc: { color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' },
  sosArrow: { fontSize: '2rem', color: 'rgba(255,255,255,0.8)' },
  sectionTitle: {
    fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', fontWeight: 600,
    letterSpacing: '0.04em', color: 'var(--text-primary)',
    marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px',
  },
  requestCard: {
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '18px 20px',
    marginBottom: '10px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '16px',
    transition: 'border-color var(--transition)',
  },
  requestLeft: { flex: 1 },
  requestId: { fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: '4px' },
  requestNeeds: { fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' },
  requestDate: { fontSize: '0.78rem', color: 'var(--text-muted)' },
  statusBadge: (status) => ({
    padding: '4px 12px', borderRadius: '20px',
    background: STATUS_CONFIG[status]?.bg || 'var(--bg-elevated)',
    color: STATUS_CONFIG[status]?.color || 'var(--text-secondary)',
    fontSize: '0.78rem', fontWeight: 600,
    fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
  }),
  trackBtn: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '7px 14px',
    color: 'var(--text-secondary)', fontSize: '0.8rem',
    fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em',
    cursor: 'pointer', flexShrink: 0,
    transition: 'all var(--transition)',
  },
  emptyState: {
    background: 'var(--bg-surface)', border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '40px',
    textAlign: 'center', color: 'var(--text-muted)',
  },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '10px' },
  emptyText: { fontSize: '0.9rem' },
};

const VictimDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sos')
      .then((res) => setRequests(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <div style={styles.logoIcon}>🌊</div>
          <div>
            <div style={styles.topTitle}>DISASTER RESPONSE</div>
            <div style={styles.topSub}>VICTIM PORTAL</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.userChip}>
            <div style={styles.userDot} />
            {user?.name}
          </div>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
            SIGN OUT
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.greeting}>
          <div style={styles.greetingTitle}>Hello, {user?.name?.split(' ')[0]} 👋</div>
          <div style={styles.greetingSub}>Manage your emergency requests below.</div>
        </div>

        {/* Big SOS Button */}
        <Link to="/victim/sos" style={{ textDecoration: 'none' }}>
          <div
            style={styles.sosCard}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(230,57,70,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(230,57,70,0.3)'; }}
          >
            <div style={styles.sosLeft}>
              <div style={styles.sosTitle}>🆘 SEND SOS REQUEST</div>
              <div style={styles.sosDesc}>Tap here to request emergency rescue and aid</div>
            </div>
            <div style={styles.sosArrow}>→</div>
          </div>
        </Link>

        {/* Request History */}
        <div style={styles.sectionTitle}>
          📋 Your Requests
          <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>
            ({requests.length})
          </span>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <div style={styles.emptyText}>No requests yet. Use the SOS button above when you need help.</div>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req._id} style={styles.requestCard}>
              <div style={styles.requestLeft}>
                <div style={styles.requestId}>#{req._id.slice(-8).toUpperCase()}</div>
                <div style={styles.requestNeeds}>{req.needs.join(', ')}</div>
                <div style={styles.requestDate}>{new Date(req.createdAt).toLocaleString()}</div>
              </div>
              <div style={styles.statusBadge(req.status)}>
                {STATUS_CONFIG[req.status]?.label || req.status}
              </div>
              {req.status !== 'closed' && req.status !== 'rescued' && (
                <button style={styles.trackBtn} onClick={() => navigate(`/victim/track/${req._id}`)}>
                  TRACK
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VictimDashboard;
