import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  bgLines: {
    position: 'fixed',
    inset: 0,
    backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
    opacity: 0.2,
    pointerEvents: 'none',
  },
  container: {
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeUp 0.4s ease both',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    marginBottom: '24px',
    fontFamily: 'IBM Plex Mono, monospace',
    letterSpacing: '0.05em',
    transition: 'color var(--transition)',
  },
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '36px',
    boxShadow: 'var(--shadow)',
  },
  icon: {
    width: '52px',
    height: '52px',
    background: 'var(--accent-dim)',
    border: '1px solid rgba(230,57,70,0.3)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.8rem',
    fontFamily: 'Oswald, sans-serif',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  desc: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setError('');
    setStatus('loading');
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('sent');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
      setStatus('idle');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgLines} />
      <div style={styles.container}>
        <Link to="/login" style={styles.backLink}>← Back to sign in</Link>
        <div style={styles.card}>
          <div style={styles.icon}>🔑</div>
          <div style={styles.title}>Forgot Password?</div>
          <div style={styles.desc}>
            Enter your registered email and we'll send you a link to reset your password.
          </div>

          {status === 'sent' ? (
            <div className="success-msg">
              ✓ Reset link sent! Check your inbox (and spam folder).
            </div>
          ) : (
            <form style={styles.form} onSubmit={handleSubmit}>
              {error && <div className="error-msg">{error}</div>}
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="btn-primary" type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'SEND RESET LINK'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
