import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const NEEDS = [
  { value: 'food',      emoji: '🍱', label: 'Food' },
  { value: 'medicine',  emoji: '💊', label: 'Medicine' },
  { value: 'shelter',   emoji: '🏠', label: 'Shelter' },
  { value: 'water',     emoji: '💧', label: 'Water' },
  { value: 'clothing',  emoji: '👕', label: 'Clothing' },
  { value: 'other',     emoji: '📦', label: 'Other' },
];

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    padding: '0',
  },
  // Top alert bar
  alertBanner: {
    background: 'var(--accent)',
    padding: '10px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.8rem',
    fontFamily: 'IBM Plex Mono, monospace',
    letterSpacing: '0.06em',
    fontWeight: 500,
  },
  alertDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#fff',
    animation: 'pulse-dot 1s ease infinite',
    flexShrink: 0,
  },
  topBar: {
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  topBarIcon: {
    width: '36px',
    height: '36px',
    background: 'var(--accent)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
  },
  topBarTitle: {
    fontFamily: 'Oswald, sans-serif',
    fontSize: '1.1rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'var(--text-primary)',
  },
  topBarSub: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontFamily: 'IBM Plex Mono, monospace',
  },
  content: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '40px 24px 80px',
    animation: 'fadeUp 0.4s ease both',
  },
  pageHeader: {
    marginBottom: '32px',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(230,57,70,0.15)',
    border: '1px solid rgba(230,57,70,0.35)',
    borderRadius: '4px',
    padding: '4px 12px',
    fontSize: '0.7rem',
    fontFamily: 'IBM Plex Mono, monospace',
    color: 'var(--accent)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  pageTitle: {
    fontSize: '2.2rem',
    fontFamily: 'Oswald, sans-serif',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  pageDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  section: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    marginBottom: '16px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '18px',
    paddingBottom: '14px',
    borderBottom: '1px solid var(--border)',
  },
  sectionNum: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontFamily: 'Oswald, sans-serif',
    fontWeight: 700,
    flexShrink: 0,
  },
  sectionTitle: {
    fontFamily: 'Oswald, sans-serif',
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'var(--text-primary)',
  },
  needsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  needBtn: (selected) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '14px 10px',
    background: selected ? 'var(--accent-dim)' : 'var(--bg-input)',
    border: `1px solid ${selected ? 'rgba(230,57,70,0.5)' : 'var(--border)'}`,
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    userSelect: 'none',
  }),
  needEmoji: {
    fontSize: '1.5rem',
    lineHeight: 1,
  },
  needLabel: (selected) => ({
    fontSize: '0.78rem',
    fontWeight: 600,
    color: selected ? 'var(--accent)' : 'var(--text-secondary)',
    fontFamily: 'Oswald, sans-serif',
    letterSpacing: '0.04em',
  }),
  // GPS status box
  gpsBox: (status) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    background: status === 'success' ? 'rgba(46,204,113,0.08)' : status === 'error' ? 'rgba(230,57,70,0.08)' : 'var(--bg-input)',
    border: `1px solid ${status === 'success' ? 'rgba(46,204,113,0.3)' : status === 'error' ? 'rgba(230,57,70,0.3)' : 'var(--border)'}`,
    borderRadius: 'var(--radius)',
  }),
  gpsIcon: {
    fontSize: '1.4rem',
    lineHeight: 1,
  },
  gpsInfo: {
    flex: 1,
  },
  gpsTitle: (status) => ({
    fontSize: '0.875rem',
    fontWeight: 600,
    color: status === 'success' ? 'var(--success)' : status === 'error' ? 'var(--accent)' : 'var(--text-primary)',
    marginBottom: '2px',
  }),
  gpsCoords: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontFamily: 'IBM Plex Mono, monospace',
  },
  gpsBtn: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '7px 14px',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontFamily: 'Oswald, sans-serif',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all var(--transition)',
  },
  submitSection: {
    marginTop: '8px',
  },
  infoNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 16px',
    background: 'rgba(52,152,219,0.08)',
    border: '1px solid rgba(52,152,219,0.2)',
    borderRadius: 'var(--radius)',
    marginBottom: '16px',
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
};

const CreateSOS = () => {
  const navigate = useNavigate();
  const [needs, setNeeds] = useState([]);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | success | error
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fetch GPS on mount
  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates([pos.coords.longitude, pos.coords.latitude]);
        setGpsStatus('success');
      },
      () => setGpsStatus('error'),
      { timeout: 10000 }
    );
  };

  const toggleNeed = (value) => {
    setNeeds((prev) =>
      prev.includes(value) ? prev.filter((n) => n !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (needs.length === 0) return setError('Please select at least one need.');
    if (!coordinates) return setError('Location is required. Please allow GPS access.');

    setLoading(true);
    try {
      const res = await api.post('/sos', { needs, description, coordinates, address });
      navigate(`/victim/track/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send SOS. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const gpsStatusText = {
    idle:    { title: 'Detecting location...', coords: 'Waiting for GPS signal' },
    loading: { title: 'Acquiring GPS signal...', coords: 'Please wait' },
    success: { title: 'Location acquired', coords: coordinates ? `${coordinates[1].toFixed(5)}°N, ${coordinates[0].toFixed(5)}°E` : '' },
    error:   { title: 'Location unavailable', coords: 'GPS access denied or unavailable' },
  };

  return (
    <div style={styles.page}>
      {/* Alert Banner */}
      <div style={styles.alertBanner}>
        <div style={styles.alertDot} />
        SOS REQUEST FORM — YOUR LOCATION WILL BE SHARED WITH RESCUE TEAMS
      </div>

      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <div style={styles.topBarIcon}>🌊</div>
          <div>
            <div style={styles.topBarTitle}>DISASTER RESPONSE PLATFORM</div>
            <div style={styles.topBarSub}>VICTIM PORTAL</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.pageHeader}>
          <div style={styles.tag}>
            <span style={{ animation: 'pulse-dot 1s infinite', display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
            EMERGENCY REQUEST
          </div>
          <div style={styles.pageTitle}>Request Rescue & Aid</div>
          <div style={styles.pageDesc}>
            Fill in the details below. Your request will be assigned to the nearest available volunteer.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1 - Needs */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNum}>1</div>
              <div style={styles.sectionTitle}>What do you need? (select all that apply)</div>
            </div>
            <div style={styles.needsGrid}>
              {NEEDS.map((n) => (
                <div key={n.value} style={styles.needBtn(needs.includes(n.value))} onClick={() => toggleNeed(n.value)}>
                  <div style={styles.needEmoji}>{n.emoji}</div>
                  <div style={styles.needLabel(needs.includes(n.value))}>{n.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2 - Location */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNum}>2</div>
              <div style={styles.sectionTitle}>Your Location</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={styles.gpsBox(gpsStatus)}>
                <div style={styles.gpsIcon}>📍</div>
                <div style={styles.gpsInfo}>
                  <div style={styles.gpsTitle(gpsStatus)}>{gpsStatusText[gpsStatus].title}</div>
                  <div style={styles.gpsCoords}>{gpsStatusText[gpsStatus].coords}</div>
                </div>
                {gpsStatus !== 'loading' && (
                  <button type="button" style={styles.gpsBtn} onClick={fetchLocation}>
                    {gpsStatus === 'success' ? 'REFRESH' : 'RETRY'}
                  </button>
                )}
              </div>
              <div className="field">
                <label>Address / Landmark (optional but helpful)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Bashundhara City, Dhaka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3 - Description */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNum}>3</div>
              <div style={styles.sectionTitle}>Describe Your Situation</div>
            </div>
            <div className="field">
              <label>Additional Details</label>
              <textarea
                rows={4}
                placeholder="Describe your situation, number of people, any injuries, accessibility issues, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Submit */}
          <div style={styles.submitSection}>
            {error && <div className="error-msg" style={{ marginBottom: '14px' }}>{error}</div>}
            <div style={styles.infoNote}>
              ℹ️ Once submitted, your request will be immediately visible to nearby volunteers. You will be able to track the rescue status in real time.
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ fontSize: '1.05rem', padding: '15px' }}>
              {loading ? 'Sending SOS...' : '🆘 SEND EMERGENCY REQUEST'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSOS;
