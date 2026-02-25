import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/* ── Keyframes injected once ── */
const injectStyles = () => {
  if (document.getElementById('lp-keyframes')) return;
  const el = document.createElement('style');
  el.id = 'lp-keyframes';
  el.textContent = `
    @keyframes scanline {
      0%   { transform: translateY(-100%); opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { transform: translateY(100vh); opacity: 0; }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; } 50% { opacity: 0; }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes borderPulse {
      0%, 100% { border-color: rgba(230,57,70,0.3); }
      50%       { border-color: rgba(230,57,70,0.8); }
    }
    @keyframes rotateSlow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .lp-nav-link {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.78rem;
      letter-spacing: 0.08em;
      color: #8892a4;
      text-decoration: none;
      text-transform: uppercase;
      transition: color 0.18s ease;
    }
    .lp-nav-link:hover { color: #eef0f4; }
    .lp-feature-card {
      background: #111318;
      border: 1px solid #2a2f3a;
      border-radius: 10px;
      padding: 28px 24px;
      transition: border-color 0.2s ease, transform 0.2s ease;
      cursor: default;
    }
    .lp-feature-card:hover {
      border-color: rgba(230,57,70,0.5);
      transform: translateY(-3px);
    }
    .lp-role-card {
      background: #111318;
      border: 1px solid #2a2f3a;
      border-radius: 10px;
      padding: 24px;
      transition: all 0.2s ease;
    }
    .lp-role-card:hover {
      border-color: rgba(230,57,70,0.4);
      background: #14171e;
    }
    .lp-cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #e63946;
      color: #fff;
      padding: 14px 32px;
      border-radius: 6px;
      font-family: 'Oswald', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-decoration: none;
      transition: all 0.18s ease;
      border: none;
      cursor: pointer;
    }
    .lp-cta-btn:hover {
      background: #ff4757;
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(230,57,70,0.4);
      color: #fff;
    }
    .lp-cta-ghost {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: transparent;
      color: #eef0f4;
      padding: 14px 32px;
      border-radius: 6px;
      font-family: 'Oswald', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-decoration: none;
      border: 1px solid #2a2f3a;
      transition: all 0.18s ease;
    }
    .lp-cta-ghost:hover {
      border-color: #eef0f4;
      background: rgba(255,255,255,0.05);
      color: #eef0f4;
    }
    .lp-stat-card {
      border-right: 1px solid #2a2f3a;
      padding: 0 40px;
      animation: countUp 0.5s ease both;
    }
    .lp-stat-card:last-child { border-right: none; }
    @media (max-width: 768px) {
      .lp-stat-card { border-right: none; border-bottom: 1px solid #2a2f3a; padding: 20px 0; }
      .lp-stat-card:last-child { border-bottom: none; }
    }
  `;
  document.head.appendChild(el);
};

const FEATURES = [
  {
    icon: '🆘',
    title: 'SOS Emergency Requests',
    desc: 'Victims send instant help requests with auto-captured GPS coordinates, media uploads, and specific needs — food, medicine, shelter, water.',
  },
  {
    icon: '📍',
    title: 'Live Rescue Tracking',
    desc: "Real-time status updates let victims follow their rescue from 'Assigned' through 'On the Way' to 'Rescued' — every step visible.",
  },
  {
    icon: '🗺️',
    title: 'Volunteer Map & Dispatch',
    desc: 'Volunteers see nearby SOS requests plotted on a live map. The system auto-assigns the closest available responder using geospatial queries.',
  },
  {
    icon: '🏕️',
    title: 'Relief Camp Management',
    desc: 'NGOs create and manage relief camps, assign volunteers, track capacity, and log aid distribution with full inventory records.',
  },
  {
    icon: '📦',
    title: 'Inventory & Stock Alerts',
    desc: 'Full CRUD inventory management with automatic low-stock alerts when supplies drop below threshold — keeping NGOs ahead of shortages.',
  },
  {
    icon: '📡',
    title: 'Emergency Broadcasts',
    desc: 'Admins push system-wide alerts via in-app notifications and email blasts — reaching victims, volunteers, and NGOs simultaneously.',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    desc: 'Command center analytics: rescue counts, average response times, volunteer activity rankings, and aid distribution by category.',
  },
  {
    icon: '🛡️',
    title: 'Role-Based Access Control',
    desc: 'Four distinct roles — Victim, Volunteer, NGO, Admin — each with scoped permissions and a dedicated portal view.',
  },
];

const ROLES = [
  {
    emoji: '🆘',
    name: 'Victim',
    color: '#e63946',
    desc: 'Send SOS requests, share your location, specify needs, and track your rescue status in real time.',
    actions: ['Create emergency request', 'Upload photos & videos', 'Select aid type', 'Track rescue live'],
  },
  {
    emoji: '🙋',
    name: 'Volunteer',
    color: '#3498db',
    desc: 'Browse nearby requests on a map, accept missions, navigate to victims, and update your task status.',
    actions: ['View nearby SOS on map', 'Accept or reject tasks', 'Update rescue progress', 'Build reliability score'],
  },
  {
    emoji: '🏕️',
    name: 'NGO / Relief Team',
    color: '#2ecc71',
    desc: 'Manage supply inventory, operate relief camps, assign volunteers, and track every unit of aid distributed.',
    actions: ['Manage supply inventory', 'Create & run relief camps', 'Assign field volunteers', 'Log aid distribution'],
  },
  {
    emoji: '🛡️',
    name: 'Admin',
    color: '#f39c12',
    desc: 'Monitor the entire operation from a command dashboard — set priorities, broadcast alerts, generate reports.',
    actions: ['Live operations map', 'Set request priorities', 'Broadcast emergency alerts', 'Analytics & reports'],
  },
];

const STATS = [
  { value: '20', label: 'Platform Features', suffix: '' },
  { value: '4',  label: 'User Roles',        suffix: '' },
  { value: '50', label: 'km Dispatch Radius', suffix: '+' },
  { value: '24', label: 'Hour Coverage',      suffix: '/7' },
];

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [tick, setTick] = useState(true);

  useEffect(() => {
    injectStyles();
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    const iv = setInterval(() => setTick((t) => !t), 900);
    return () => { window.removeEventListener('scroll', onScroll); clearInterval(iv); };
  }, []);

  return (
    <div style={{ background: '#0a0c0f', color: '#eef0f4', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(10,12,15,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #2a2f3a' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, background: '#e63946', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
          }}>🌊</div>
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.04em', lineHeight: 1 }}>
              DISASTER RESPONSE
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.6rem', color: '#4a5260', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Relief Coordination Platform
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#roles" className="lp-nav-link">Roles</a>
          <a href="#about" className="lp-nav-link">About</a>
          <Link
            to="/login"
            style={{
              fontFamily: 'Oswald, sans-serif', fontSize: '0.85rem', fontWeight: 600,
              letterSpacing: '0.06em', color: '#fff', background: '#e63946',
              padding: '8px 20px', borderRadius: '6px', textDecoration: 'none',
              transition: 'all 0.18s ease', border: '1px solid transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ff4757'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(230,57,70,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#e63946'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            LOGIN →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '100px 40px 80px',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(#1a1f2a 1px, transparent 1px), linear-gradient(90deg, #1a1f2a 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.5,
        }} />

        {/* Scanline effect */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(230,57,70,0.4), transparent)',
          animation: 'scanline 6s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '10%', right: '5%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(230,57,70,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,152,219,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>

            {/* Left */}
            <div style={{ animation: 'fadeSlideUp 0.6s ease both' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.3)',
                borderRadius: '4px', padding: '5px 14px', marginBottom: '24px',
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#e63946',
                  animation: 'blink 1s ease infinite',
                }} />
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', color: '#e63946', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  SYSTEM OPERATIONAL
                </span>
              </div>

              <h1 style={{
                fontFamily: 'Oswald, sans-serif', fontWeight: 700,
                fontSize: 'clamp(2.8rem, 5vw, 4.2rem)', lineHeight: 1.05,
                marginBottom: '24px', letterSpacing: '0.01em',
              }}>
                WHEN EVERY<br />
                SECOND <span style={{ color: '#e63946', position: 'relative' }}>MATTERS</span><span style={{ color: '#e63946' }}>.</span>
              </h1>

              <p style={{
                color: '#8892a4', fontSize: '1.05rem', lineHeight: 1.75,
                maxWidth: '440px', marginBottom: '36px',
              }}>
                A centralized emergency coordination platform connecting disaster victims with volunteers, NGOs,
                and response teams — in real time, at scale, under pressure.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link to="/register" className="lp-cta-btn">
                  🆘 GET STARTED
                </Link>
                <a href="#features" className="lp-cta-ghost">
                  SEE FEATURES ↓
                </a>
              </div>
            </div>

            {/* Right — Command Console */}
            <div style={{ animation: 'fadeSlideUp 0.6s ease 0.15s both' }}>
              <div style={{
                background: '#0e1117',
                border: '1px solid #2a2f3a',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                animation: 'borderPulse 3s ease infinite',
              }}>
                {/* Console header bar */}
                <div style={{
                  background: '#111318', borderBottom: '1px solid #2a2f3a',
                  padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  {['#e63946','#f39c12','#2ecc71'].map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
                  ))}
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', color: '#4a5260', marginLeft: 8, letterSpacing: '0.06em' }}>
                    COMMAND CENTER — LIVE FEED
                  </span>
                </div>

                {/* Console lines */}
                <div style={{ padding: '18px', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.78rem', lineHeight: 2, color: '#4a5260' }}>
                  {[
                    { prefix: '>', color: '#e63946', text: 'SOS_REQUEST received — victim_id: #A3F2', delay: 0 },
                    { prefix: '✓', color: '#3498db', text: 'GPS acquired — [23.8103°N, 90.4125°E]', delay: 0.1 },
                    { prefix: '⚡', color: '#f39c12', text: 'Priority: CRITICAL — dispatching volunteer', delay: 0.2 },
                    { prefix: '✓', color: '#2ecc71', text: 'Nearest volunteer assigned — ETA 8 min', delay: 0.3 },
                    { prefix: '📡', color: '#9b59b6', text: 'NGO notified — camp_id: CAMP-07 alerted', delay: 0.4 },
                    { prefix: '📊', color: '#8892a4', text: 'Dashboard updated — 12 active requests', delay: 0.5 },
                    { prefix: tick ? '█' : ' ', color: '#e63946', text: '', delay: 0.6 },
                  ].map((line, i) => (
                    <div key={i} style={{ animation: `fadeSlideUp 0.4s ease ${line.delay + 0.4}s both`, display: 'flex', gap: '10px' }}>
                      <span style={{ color: line.color, flexShrink: 0 }}>{line.prefix}</span>
                      <span style={{ color: i < 6 ? '#8892a4' : 'transparent' }}>{line.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini status strip */}
              <div style={{
                display: 'flex', gap: '10px', marginTop: '12px',
              }}>
                {[
                  { label: 'REQUESTS', val: '12', color: '#e63946' },
                  { label: 'VOLUNTEERS', val: '8', color: '#3498db' },
                  { label: 'RESCUED', val: '47', color: '#2ecc71' },
                ].map((s) => (
                  <div key={s.label} style={{
                    flex: 1, background: '#111318', border: '1px solid #2a2f3a',
                    borderRadius: 8, padding: '10px 14px',
                    display: 'flex', flexDirection: 'column', gap: 2,
                  }}>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.6rem', color: '#4a5260', letterSpacing: '0.1em' }}>{s.label}</div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{
        background: '#0e1117', borderTop: '1px solid #2a2f3a', borderBottom: '1px solid #2a2f3a',
        padding: '40px',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap',
        }}>
          {STATS.map((s, i) => (
            <div key={i} className="lp-stat-card" style={{ textAlign: 'center', animationDelay: `${i * 0.1}s` }}>
              <div style={{
                fontFamily: 'Oswald, sans-serif', fontSize: '2.8rem', fontWeight: 700,
                color: '#eef0f4', lineHeight: 1, marginBottom: '4px',
              }}>
                {s.value}<span style={{ color: '#e63946' }}>{s.suffix}</span>
              </div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', color: '#4a5260', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-block', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem',
              color: '#e63946', letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '14px', padding: '4px 14px',
              background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)', borderRadius: 4,
            }}>Platform Capabilities</div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, marginBottom: '14px' }}>
              BUILT FOR THE <span style={{ color: '#e63946' }}>FRONTLINE</span>
            </h2>
            <p style={{ color: '#8892a4', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
              Every feature is purpose-built for high-stakes, time-critical disaster response operations.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div style={{ fontSize: '1.8rem', marginBottom: '14px' }}>{f.icon}</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem', fontWeight: 600, letterSpacing: '0.03em', marginBottom: '8px', color: '#eef0f4' }}>
                  {f.title}
                </div>
                <p style={{ color: '#8892a4', fontSize: '0.85rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" style={{
        padding: '100px 40px',
        background: '#0a0c0f',
        borderTop: '1px solid #2a2f3a',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: '40%',
          background: 'radial-gradient(ellipse at right center, rgba(230,57,70,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '60px' }}>
            <div style={{
              display: 'inline-block', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem',
              color: '#e63946', letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '14px', padding: '4px 14px',
              background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)', borderRadius: 4,
            }}>User Roles</div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700 }}>
              ONE PLATFORM,<br /><span style={{ color: '#e63946' }}>FOUR ROLES</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {ROLES.map((r, i) => (
              <div key={i} className="lp-role-card">
                <div style={{
                  width: 48, height: 48, borderRadius: 10, marginBottom: 16,
                  background: `${r.color}18`, border: `1px solid ${r.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                }}>
                  {r.emoji}
                </div>
                <div style={{
                  fontFamily: 'Oswald, sans-serif', fontSize: '1.2rem', fontWeight: 700,
                  color: r.color, letterSpacing: '0.04em', marginBottom: 8,
                }}>{r.name.toUpperCase()}</div>
                <p style={{ color: '#8892a4', fontSize: '0.845rem', lineHeight: 1.65, marginBottom: 16 }}>
                  {r.desc}
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {r.actions.map((a, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#8892a4' }}>
                      <span style={{ color: r.color, fontSize: '0.6rem' }}>▶</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / TECH STACK ── */}
      <section id="about" style={{ padding: '100px 40px', borderTop: '1px solid #2a2f3a' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-block', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem',
              color: '#e63946', letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '14px', padding: '4px 14px',
              background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)', borderRadius: 4,
            }}>About the Project</div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '20px' }}>
              BUILT FOR A<br />
              <span style={{ color: '#e63946' }}>REAL PROBLEM</span>
            </h2>
            <p style={{ color: '#8892a4', lineHeight: 1.8, marginBottom: '16px', fontSize: '0.925rem' }}>
              During natural disasters, coordination failure kills people. Victims can't reach help. Volunteers
              don't know where to go. NGOs run out of supplies. Information is scattered across phone calls,
              WhatsApp groups, and spreadsheets.
            </p>
            <p style={{ color: '#8892a4', lineHeight: 1.8, fontSize: '0.925rem' }}>
              This platform was designed to eliminate that chaos — a single, structured system where every
              actor in a relief operation works from the same real-time data, with clear roles, live tracking,
              and a full audit trail.
            </p>
          </div>

          {/* Tech stack */}
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '20px', color: '#8892a4' }}>
              TECH STACK
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { layer: 'Frontend',   tech: 'React 18 + Vite',         icon: '⚛️' },
                { layer: 'Routing',    tech: 'React Router v6',         icon: '🔀' },
                { layer: 'Maps',       tech: 'Leaflet.js + OpenStreetMap', icon: '🗺️' },
                { layer: 'Backend',    tech: 'Node.js + Express 4',     icon: '🖥️' },
                { layer: 'Database',   tech: 'MongoDB Atlas (Mongoose)', icon: '🍃' },
                { layer: 'Auth',       tech: 'JWT + bcryptjs',          icon: '🔐' },
                { layer: 'Email',      tech: 'Nodemailer',              icon: '📧' },
                { layer: 'Architecture', tech: 'MVC Pattern',           icon: '🏗️' },
              ].map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: '#111318', border: '1px solid #2a2f3a',
                  borderRadius: 8, padding: '12px 16px',
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.72rem', color: '#4a5260', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {t.layer}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#eef0f4', fontWeight: 500 }}>
                      {t.tech}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '100px 40px',
        borderTop: '1px solid #2a2f3a',
        background: '#0e1117',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(#1a1f2a 1px, transparent 1px), linear-gradient(90deg, #1a1f2a 1px, transparent 1px)',
          backgroundSize: '50px 50px', opacity: 0.3,
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(230,57,70,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '16px', lineHeight: 1.1 }}>
            READY TO JOIN THE<br />
            <span style={{ color: '#e63946' }}>RESPONSE NETWORK?</span>
          </h2>
          <p style={{ color: '#8892a4', fontSize: '1rem', marginBottom: '36px', lineHeight: 1.7 }}>
            Create your account and be part of a faster, smarter disaster response.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="lp-cta-btn">
              🆘 CREATE ACCOUNT
            </Link>
            <Link to="/login" className="lp-cta-ghost">
              SIGN IN →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid #2a2f3a', padding: '28px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 28, height: 28, background: '#e63946', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
            🌊
          </div>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.72rem', color: '#4a5260', letterSpacing: '0.06em' }}>
            DISASTER RESPONSE PLATFORM — SEC03 GROUP 05
          </span>
        </div>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', color: '#4a5260', letterSpacing: '0.06em' }}>
          BUILT WITH MERN STACK + MVC ARCHITECTURE
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
