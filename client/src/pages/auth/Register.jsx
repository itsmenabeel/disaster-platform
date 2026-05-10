import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertOctagon, UserCheck, Tent, Waves } from 'lucide-react';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgLines: {
    position: 'fixed',
    inset: 0,
    backgroundImage:
      'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
    opacity: 0.2,
    pointerEvents: 'none',
  },
  bgGlow1: {
    position: 'fixed',
    top: '-150px',
    right: '-150px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(230,57,70,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'fixed',
    bottom: '-150px',
    left: '-150px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(52,152,219,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%',
    maxWidth: '520px',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeUp 0.4s ease both',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '32px',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: 'var(--accent)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
  },
  logoText: {
    fontFamily: 'Oswald, sans-serif',
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'var(--text-secondary)',
  },
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '36px',
    boxShadow: 'var(--shadow)',
  },
  header: {
    marginBottom: '28px',
  },
  tag: {
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
    marginBottom: '10px',
  },
  title: {
    fontSize: '1.9rem',
    fontFamily: 'Oswald, sans-serif',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginTop: '4px',
  },
  roleOption: (selected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    background: selected ? 'var(--accent-dim)' : 'var(--bg-input)',
    border: `1px solid ${selected ? 'rgba(230,57,70,0.5)' : 'var(--border)'}`,
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }),
  roleEmoji: {
    fontSize: '1.2rem',
    lineHeight: 1,
  },
  roleInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  roleName: (selected) => ({
    fontSize: '0.85rem',
    fontWeight: 600,
    color: selected ? 'var(--accent)' : 'var(--text-primary)',
    fontFamily: 'Oswald, sans-serif',
    letterSpacing: '0.04em',
  }),
  roleDesc: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: '1px',
  },
  sectionLabel: {
    fontSize: '0.78rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-secondary)',
    marginBottom: '2px',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    margin: '4px 0',
  },
  footer: {
    textAlign: 'center',
    marginTop: '18px',
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
};

const ROLES = [
  { value: 'victim',    emoji: <AlertOctagon size={18} />, name: 'Victim',    desc: 'Request rescue & aid' },
  { value: 'volunteer', emoji: <UserCheck size={18} />,    name: 'Volunteer',  desc: 'Respond to requests' },
  { value: 'ngo',       emoji: <Tent size={18} />,         name: 'NGO',        desc: 'Manage resources' },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'victim' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (/^\d+$/.test(form.name.trim())) {
      return setError('Full name cannot contain only numbers.');
    }
    if (form.phone && (!/^\d{11}$/.test(form.phone))) {
      return setError('Phone number must be exactly 11 digits (numbers only).');
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      const user = await register(data);
      const routes = { victim: '/victim', volunteer: '/volunteer', ngo: '/ngo', admin: '/admin' };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgLines} />
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.container}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}><Waves size={18} /></div>
          <span style={styles.logoText}>DISASTER RESPONSE PLATFORM</span>
        </div>

        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.tag}>⬤ New Account</div>
            <div style={styles.title}>Create Account</div>
            <div style={styles.subtitle}>Join the emergency response network</div>
          </div>

          <form style={styles.form} onSubmit={handleSubmit}>
            {error && <div className="error-msg">{error}</div>}

            <div style={styles.row}>
              <div className="field">
                <label>Full Name</label>
                <input name="name" placeholder="Jane Doe" value={form.name} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Phone (optional)</label>
                <input
                  name="phone"
                  placeholder="11-digit number"
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setForm({ ...form, phone: val });
                  }}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="field">
              <label>Email Address</label>
              <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>

            <div style={styles.row}>
              <div className="field">
                <label>Password</label>
                <input type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            <div style={styles.divider} />

            <div>
              <div style={styles.sectionLabel}>Select Your Role</div>
              <div style={styles.roleGrid}>
                {ROLES.map((r) => (
                  <div
                    key={r.value}
                    style={styles.roleOption(form.role === r.value)}
                    onClick={() => setForm({ ...form, role: r.value })}
                  >
                    <div style={styles.roleEmoji}>{r.emoji}</div>
                    <div style={styles.roleInfo}>
                      <span style={styles.roleName(form.role === r.value)}>{r.name}</span>
                      <span style={styles.roleDesc}>{r.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.divider} />

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>

        <div style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
