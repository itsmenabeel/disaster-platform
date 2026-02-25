import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
  },
  // Left decorative panel
  panel: {
    width: '42%',
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '48px',
    position: 'relative',
    overflow: 'hidden',
  },
  panelGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    opacity: 0.4,
  },
  panelGlow: {
    position: 'absolute',
    bottom: '-80px',
    left: '-80px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(230,57,70,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    zIndex: 1,
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'var(--accent)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
  },
  logoText: {
    fontFamily: 'Oswald, sans-serif',
    fontSize: '1.1rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontFamily: 'IBM Plex Mono, monospace',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  panelContent: {
    position: 'relative',
    zIndex: 1,
  },
  panelTitle: {
    fontSize: '2.8rem',
    fontFamily: 'Oswald, sans-serif',
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: '20px',
    color: 'var(--text-primary)',
  },
  accentWord: {
    color: 'var(--accent)',
  },
  panelDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: 1.7,
    maxWidth: '300px',
  },
  statusBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    position: 'relative',
    zIndex: 1,
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontFamily: 'IBM Plex Mono, monospace',
  },
  dot: (color) => ({
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: color,
    animation: 'pulse-dot 2s ease infinite',
    flexShrink: 0,
  }),
  // Right form panel
  formSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    animation: 'fadeUp 0.4s ease both',
  },
  cardHeader: {
    marginBottom: '32px',
  },
  cardTag: {
    display: 'inline-block',
    background: 'var(--accent-dim)',
    border: '1px solid rgba(230,57,70,0.3)',
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '0.7rem',
    fontFamily: 'IBM Plex Mono, monospace',
    color: 'var(--accent)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '2rem',
    fontFamily: 'Oswald, sans-serif',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  cardSub: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    margin: '4px 0',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  forgotLink: {
    display: 'block',
    textAlign: 'right',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '-10px',
  },
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const routes = { victim: '/victim', volunteer: '/volunteer', ngo: '/ngo', admin: '/admin' };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left Panel */}
      <div style={styles.panel}>
        <div style={styles.panelGrid} />
        <div style={styles.panelGlow} />

        <div style={styles.logo}>
          <div style={styles.logoIcon}>🌊</div>
          <div>
            <div style={styles.logoText}>DISASTER RESPONSE</div>
            <div style={styles.logoSub}>Relief Coordination Platform</div>
          </div>
        </div>

        <div style={styles.panelContent}>
          <div style={styles.panelTitle}>
            When every<br />
            second <span style={styles.accentWord}>matters.</span>
          </div>
          <p style={styles.panelDesc}>
            A centralized command system connecting victims, volunteers,
            NGOs, and response teams in real time during disaster events.
          </p>
        </div>

        <div style={styles.statusBar}>
          <div style={styles.statusItem}>
            <div style={styles.dot('var(--success)')} />
            SYSTEM OPERATIONAL
          </div>
          <div style={styles.statusItem}>
            <div style={styles.dot('var(--accent)')} />
            RESPONSE NETWORK ACTIVE
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div style={styles.formSide}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTag}>⬤ Secure Access</div>
            <div style={styles.cardTitle}>Sign In</div>
            <div style={styles.cardSub}>Enter your credentials to access the platform</div>
          </div>

          <form style={styles.form} onSubmit={handleSubmit}>
            {error && <div className="error-msg">{error}</div>}

            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot password?
            </Link>

            <div style={styles.divider} />

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Authenticating...' : 'SIGN IN'}
            </button>
          </form>

          <div style={styles.footer}>
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
