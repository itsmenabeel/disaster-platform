import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/LandingPage.css";

const FEATURES = [
  {
    icon: "🆘",
    title: "SOS Emergency Requests",
    desc: "Victims send instant help requests with auto-captured GPS coordinates, media uploads, and specific needs — food, medicine, shelter, water.",
  },
  {
    icon: "📍",
    title: "Live Rescue Tracking",
    desc: "Real-time status updates let victims follow their rescue from 'Assigned' through 'On the Way' to 'Rescued' — every step visible.",
  },
  {
    icon: "🗺️",
    title: "Volunteer Map & Dispatch",
    desc: "Volunteers see nearby SOS requests plotted on a live map. The system auto-assigns the closest available responder using geospatial queries.",
  },
  {
    icon: "🏕️",
    title: "Relief Camp Management",
    desc: "NGOs create and manage relief camps, assign volunteers, track capacity, and log aid distribution with full inventory records.",
  },
  {
    icon: "📦",
    title: "Inventory & Stock Alerts",
    desc: "Full CRUD inventory management with automatic low-stock alerts when supplies drop below threshold — keeping NGOs ahead of shortages.",
  },
  {
    icon: "📡",
    title: "Emergency Broadcasts",
    desc: "Admins push system-wide alerts via in-app notifications and email blasts — reaching victims, volunteers, and NGOs simultaneously.",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    desc: "Command center analytics: rescue counts, average response times, volunteer activity rankings, and aid distribution by category.",
  },
  {
    icon: "🛡️",
    title: "Role-Based Access Control",
    desc: "Four distinct roles — Victim, Volunteer, NGO, Admin — each with scoped permissions and a dedicated portal view.",
  },
];

const ROLES = [
  {
    emoji: "🆘",
    name: "Victim",
    color: "#e63946",
    desc: "Send SOS requests, share your location, specify needs, and track your rescue status in real time.",
    actions: [
      "Create emergency request",
      "Upload photos & videos",
      "Select aid type",
      "Track rescue live",
    ],
  },
  {
    emoji: "🙋",
    name: "Volunteer",
    color: "#3498db",
    desc: "Browse nearby requests on a map, accept missions, navigate to victims, and update your task status.",
    actions: [
      "View nearby SOS on map",
      "Accept or reject tasks",
      "Update rescue progress",
      "Build reliability score",
    ],
  },
  {
    emoji: "🏕️",
    name: "NGO / Relief Team",
    color: "#2ecc71",
    desc: "Manage supply inventory, operate relief camps, assign volunteers, and track every unit of aid distributed.",
    actions: [
      "Manage supply inventory",
      "Create & run relief camps",
      "Assign field volunteers",
      "Log aid distribution",
    ],
  },
  {
    emoji: "🛡️",
    name: "Admin",
    color: "#f39c12",
    desc: "Monitor the entire operation from a command dashboard — set priorities, broadcast alerts, generate reports.",
    actions: [
      "Live operations map",
      "Set request priorities",
      "Broadcast emergency alerts",
      "Analytics & reports",
    ],
  },
];

const STATS = [
  { value: "20", label: "Platform Features", suffix: "" },
  { value: "4", label: "User Roles", suffix: "" },
  { value: "50", label: "km Dispatch Radius", suffix: "+" },
  { value: "24", label: "Hour Coverage", suffix: "/7" },
];

const SectionHeader = ({ eyebrow, title, highlight, children, compact = false }) => (
  <div style={{ textAlign: "center", marginBottom: compact ? "56px" : "60px" }}>
    <div
      style={{
        display: "inline-block",
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: "0.7rem",
        color: "#e63946",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginBottom: "14px",
        padding: "4px 14px",
        background: "rgba(230,57,70,0.1)",
        border: "1px solid rgba(230,57,70,0.25)",
        borderRadius: 4,
      }}
    >
      {eyebrow}
    </div>
    <h2
      style={{
        fontFamily: "Oswald, sans-serif",
        fontSize: "clamp(2rem, 4vw, 3rem)",
        fontWeight: 700,
        marginBottom: children ? "14px" : 0,
      }}
    >
      {title} {highlight && <span style={{ color: "#e63946" }}>{highlight}</span>}
    </h2>
    {children && (
      <p
        style={{
          color: "#8892a4",
          maxWidth: "500px",
          margin: "0 auto",
          lineHeight: 1.7,
          fontSize: "0.95rem",
        }}
      >
        {children}
      </p>
    )}
  </div>
);

const FeatureCard = ({ feature }) => (
  <div className="lp-feature-card">
    <div style={{ fontSize: "1.8rem", marginBottom: "14px" }}>
      {feature.icon}
    </div>
    <div
      style={{
        fontFamily: "Oswald, sans-serif",
        fontSize: "1.05rem",
        fontWeight: 600,
        letterSpacing: "0.03em",
        marginBottom: "8px",
        color: "#eef0f4",
      }}
    >
      {feature.title}
    </div>
    <p style={{ color: "#8892a4", fontSize: "0.85rem", lineHeight: 1.65 }}>
      {feature.desc}
    </p>
  </div>
);

const StatCard = ({ stat, index }) => (
  <div
    className="lp-stat-card"
    style={{ textAlign: "center", animationDelay: `${index * 0.1}s` }}
  >
    <div
      style={{
        fontFamily: "Oswald, sans-serif",
        fontSize: "2.8rem",
        fontWeight: 700,
        color: "#eef0f4",
        lineHeight: 1,
        marginBottom: "4px",
      }}
    >
      {stat.value}
      <span style={{ color: "#e63946" }}>{stat.suffix}</span>
    </div>
    <div
      style={{
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: "0.7rem",
        color: "#4a5260",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {stat.label}
    </div>
  </div>
);

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [tick, setTick] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    const dashboards = {
      victim: "/victim",
      volunteer: "/volunteer",
      ngo: "/ngo",
      admin: "/admin",
    };
    navigate(user ? dashboards[user.role] || "/" : "/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    const iv = setInterval(() => setTick((t) => !t), 900);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(iv);
    };
  }, []);

  return (
    <div
      style={{ background: "#0a0c0f", color: "#eef0f4", overflowX: "hidden" }}
    >
      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled ? "rgba(10,12,15,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled
            ? "1px solid #2a2f3a"
            : "1px solid transparent",
          transition: "all 0.3s ease",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <div
          onClick={handleLogoClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "#e63946",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
            }}
          >
            🌊
          </div>
          <div>
            <div
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "0.95rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              DISASTER RESPONSE
            </div>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.6rem",
                color: "#4a5260",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Relief Coordination Platform
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <a href="#features" className="lp-nav-link">
            Features
          </a>
          <a href="#how" className="lp-nav-link">
            How It Works
          </a>
          <a href="#about" className="lp-nav-link">
            About
          </a>

          <Link
            to="/login"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "#fff",
              background: "#e63946",
              padding: "8px 20px",
              borderRadius: "6px",
              textDecoration: "none",
              transition: "all 0.18s ease",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ff4757";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(230,57,70,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#e63946";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            LOGIN →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          padding: "100px 40px 80px",
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(#1a1f2a 1px, transparent 1px), linear-gradient(90deg, #1a1f2a 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            opacity: 0.5,
          }}
        />

        {/* Scanline effect */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, rgba(230,57,70,0.4), transparent)",
            animation: "scanline 6s linear infinite",
            pointerEvents: "none",
          }}
        />

        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(230,57,70,0.1) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "10%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(52,152,219,0.07) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "80px",
              alignItems: "center",
            }}
          >
            {/* Left */}
            <div style={{ animation: "fadeSlideUp 0.6s ease both" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(230,57,70,0.12)",
                  border: "1px solid rgba(230,57,70,0.3)",
                  borderRadius: "4px",
                  padding: "5px 14px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#e63946",
                    animation: "blink 1s ease infinite",
                  }}
                />
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.7rem",
                    color: "#e63946",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  SYSTEM OPERATIONAL
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(2.8rem, 5vw, 4.2rem)",
                  lineHeight: 1.05,
                  marginBottom: "24px",
                  letterSpacing: "0.01em",
                }}
              >
                WHEN EVERY
                <br />
                SECOND{" "}
                <span style={{ color: "#e63946", position: "relative" }}>
                  MATTERS
                </span>
                <span style={{ color: "#e63946" }}>.</span>
              </h1>

              <p
                style={{
                  color: "#8892a4",
                  fontSize: "1.05rem",
                  lineHeight: 1.75,
                  maxWidth: "440px",
                  marginBottom: "36px",
                }}
              >
                A centralized emergency coordination platform connecting
                disaster victims with volunteers, NGOs, and response teams — in
                real time, at scale, under pressure.
              </p>

              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <Link to="/register" className="lp-cta-btn">
                  🆘 GET STARTED
                </Link>
                <a href="#features" className="lp-cta-ghost">
                  SEE FEATURES ↓
                </a>
              </div>
            </div>

            {/* Right — Command Console */}
            <div style={{ animation: "fadeSlideUp 0.6s ease 0.15s both" }}>
              <div
                style={{
                  background: "#0e1117",
                  border: "1px solid #2a2f3a",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                  animation: "borderPulse 3s ease infinite",
                }}
              >
                {/* Console header bar */}
                <div
                  style={{
                    background: "#111318",
                    borderBottom: "1px solid #2a2f3a",
                    padding: "12px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {["#e63946", "#f39c12", "#2ecc71"].map((c, i) => (
                    <div
                      key={i}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: c,
                        opacity: 0.7,
                      }}
                    />
                  ))}
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: "0.7rem",
                      color: "#4a5260",
                      marginLeft: 8,
                      letterSpacing: "0.06em",
                    }}
                  >
                    COMMAND CENTER — LIVE FEED
                  </span>
                </div>

                {/* Console lines */}
                <div
                  style={{
                    padding: "18px",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.78rem",
                    lineHeight: 2,
                    color: "#4a5260",
                  }}
                >
                  {[
                    {
                      prefix: ">",
                      color: "#e63946",
                      text: "SOS_REQUEST received — victim_id: #A3F2",
                      delay: 0,
                    },
                    {
                      prefix: "✓",
                      color: "#3498db",
                      text: "GPS acquired — [23.8103°N, 90.4125°E]",
                      delay: 0.1,
                    },
                    {
                      prefix: "⚡",
                      color: "#f39c12",
                      text: "Priority: CRITICAL — dispatching volunteer",
                      delay: 0.2,
                    },
                    {
                      prefix: "✓",
                      color: "#2ecc71",
                      text: "Nearest volunteer assigned — ETA 8 min",
                      delay: 0.3,
                    },
                    {
                      prefix: "📡",
                      color: "#9b59b6",
                      text: "NGO notified — camp_id: CAMP-07 alerted",
                      delay: 0.4,
                    },
                    {
                      prefix: "📊",
                      color: "#8892a4",
                      text: "Dashboard updated — 12 active requests",
                      delay: 0.5,
                    },
                    {
                      prefix: tick ? "█" : " ",
                      color: "#e63946",
                      text: "",
                      delay: 0.6,
                    },
                  ].map((line, i) => (
                    <div
                      key={i}
                      style={{
                        animation: `fadeSlideUp 0.4s ease ${line.delay + 0.4}s both`,
                        display: "flex",
                        gap: "10px",
                      }}
                    >
                      <span style={{ color: line.color, flexShrink: 0 }}>
                        {line.prefix}
                      </span>
                      <span
                        style={{ color: i < 6 ? "#8892a4" : "transparent" }}
                      >
                        {line.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini status strip */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "12px",
                }}
              >
                {[
                  { label: "REQUESTS", val: "12", color: "#e63946" },
                  { label: "VOLUNTEERS", val: "8", color: "#3498db" },
                  { label: "RESCUED", val: "47", color: "#2ecc71" },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      flex: 1,
                      background: "#111318",
                      border: "1px solid #2a2f3a",
                      borderRadius: 8,
                      padding: "10px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "0.6rem",
                        color: "#4a5260",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "Oswald, sans-serif",
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        color: s.color,
                      }}
                    >
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section
        style={{
          background: "#0e1117",
          borderTop: "1px solid #2a2f3a",
          borderBottom: "1px solid #2a2f3a",
          padding: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
          }}
        >
          {STATS.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Platform Capabilities"
            title="BUILT FOR THE"
            highlight="FRONTLINE"
          >
            Every feature is purpose-built for high-stakes, time-critical
            disaster response operations.
          </SectionHeader>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how"
        style={{
          padding: "100px 40px",
          background: "#0e1117",
          borderTop: "1px solid #2a2f3a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(#1a1f2a 1px, transparent 1px), linear-gradient(90deg, #1a1f2a 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            opacity: 0.3,
          }}
        />

        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <SectionHeader
            eyebrow="Response Pipeline"
            title="HOW IT"
            highlight="WORKS"
          >
            From the moment disaster strikes to full resolution — every step
            tracked, assigned, and logged.
          </SectionHeader>

          {/* Steps */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "0",
              position: "relative",
            }}
          >
            {/* Connector line */}
            <div
              style={{
                position: "absolute",
                top: "31px",
                left: "12.5%",
                right: "12.5%",
                height: "1px",
                background:
                  "linear-gradient(90deg, #e63946, #3498db, #2ecc71, #f39c12)",
                opacity: 0.25,
                zIndex: 0,
              }}
            />

            {[
              {
                num: "01",
                icon: "🆘",
                color: "#e63946",
                title: "SEND SOS",
                desc: "Victim submits a request with auto-captured GPS, needs selection, and optional photo or video evidence.",
              },
              {
                num: "02",
                icon: "⚡",
                color: "#3498db",
                title: "VOLUNTEER DISPATCH",
                desc: "The system notifies the nearest available volunteers within a 50 km radius using geospatial matching.",
              },
              {
                num: "03",
                icon: "🚨",
                color: "#2ecc71",
                title: "LIVE RESPONSE",
                desc: "Volunteer navigates to the victim and pushes real-time status updates visible to all parties.",
              },
              {
                num: "04",
                icon: "✅",
                color: "#f39c12",
                title: "AID DELIVERED",
                desc: "NGO logs distribution, volunteer marks the task resolved, and the admin dashboard reflects the closure.",
              },
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "0 24px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "#0a0c0f",
                    border: `2px solid ${step.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    marginBottom: "20px",
                    boxShadow: `0 0 24px ${step.color}28`,
                  }}
                >
                  {step.icon}
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.62rem",
                    color: step.color,
                    letterSpacing: "0.12em",
                    marginBottom: "6px",
                  }}
                >
                  STEP {step.num}
                </div>
                <div
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "#eef0f4",
                    letterSpacing: "0.04em",
                    marginBottom: "10px",
                  }}
                >
                  {step.title}
                </div>
                <p
                  style={{
                    color: "#8892a4",
                    fontSize: "0.82rem",
                    lineHeight: 1.65,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── WHERE DO YOU FIT IN (Split CTA) ── */}
      <section
        style={{
          padding: "100px 40px",
          borderTop: "1px solid #2a2f3a",
          background: "#0a0c0f",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(230,57,70,0.05) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <SectionHeader
            eyebrow="Get Started"
            title="WHERE DO YOU"
            highlight="FIT IN?"
            compact
          >
            Every role matters. Pick yours and join the network.
          </SectionHeader>

          {/* Two cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* Victim card */}
            <div className="lp-cta-card-victim">
              <div style={{ fontSize: "2.8rem", marginBottom: "20px" }}>🆘</div>
              <div
                style={{
                  display: "inline-block",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.65rem",
                  color: "#e63946",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                  padding: "3px 10px",
                  background: "rgba(230,57,70,0.12)",
                  border: "1px solid rgba(230,57,70,0.3)",
                  borderRadius: 4,
                }}
              >
                For Victims
              </div>
              <h3
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#eef0f4",
                  lineHeight: 1.1,
                  marginBottom: "14px",
                }}
              >
                ARE YOU
                <br />
                IN DANGER?
              </h3>
              <p
                style={{
                  color: "#8892a4",
                  fontSize: "0.9rem",
                  lineHeight: 1.75,
                  marginBottom: "32px",
                  flex: 1,
                }}
              >
                Submit an SOS in seconds. Share your GPS location, select what
                you need — food, water, medicine, shelter — and attach photos or
                videos. Help is dispatched immediately.
              </p>
              <Link
                to="/register"
                className="lp-cta-btn"
                style={{ width: "fit-content" }}
              >
                🆘 REQUEST HELP NOW
              </Link>
            </div>

            {/* Responder card */}
            <div className="lp-cta-card-responder">
              <div style={{ fontSize: "2.8rem", marginBottom: "20px" }}>🙋</div>
              <div
                style={{
                  display: "inline-block",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.65rem",
                  color: "#2ecc71",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                  padding: "3px 10px",
                  background: "rgba(46,204,113,0.1)",
                  border: "1px solid rgba(46,204,113,0.3)",
                  borderRadius: 4,
                }}
              >
                For Volunteers & NGOs
              </div>
              <h3
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#eef0f4",
                  lineHeight: 1.1,
                  marginBottom: "14px",
                }}
              >
                READY TO
                <br />
                MAKE A DIFFERENCE?
              </h3>
              <p
                style={{
                  color: "#8892a4",
                  fontSize: "0.9rem",
                  lineHeight: 1.75,
                  marginBottom: "32px",
                  flex: 1,
                }}
              >
                Volunteer to respond to nearby SOS requests on a live map, or
                register as an NGO to manage relief camps, supply inventory, and
                aid distribution across your operation.
              </p>
              <Link
                to="/register"
                className="lp-cta-btn"
                style={{ background: "#2ecc71", width: "fit-content" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#27ae60";
                  e.currentTarget.style.boxShadow =
                    "0 8px 28px rgba(46,204,113,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#2ecc71";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                🙋 JOIN THE NETWORK
              </Link>
            </div>
          </div>

          {/* Sign in note */}
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.8rem",
                color: "#4a5260",
              }}
            >
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#e63946" }}>
                Sign in →
              </Link>
            </span>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section
        id="about"
        style={{
          padding: "100px 40px",
          borderTop: "1px solid #2a2f3a",
          background: "#0a0c0f",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(230,57,70,0.05) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Pull quote */}
          <div style={{ textAlign: "center", marginBottom: "72px" }}>
            <div
              style={{
                display: "inline-block",
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.7rem",
                color: "#e63946",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "20px",
                padding: "4px 14px",
                background: "rgba(230,57,70,0.1)",
                border: "1px solid rgba(230,57,70,0.25)",
                borderRadius: 4,
              }}
            >
              About the Project
            </div>
            <blockquote
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                fontWeight: 700,
                lineHeight: 1.2,
                color: "#eef0f4",
                maxWidth: "780px",
                margin: "0 auto",
              }}
            >
              "Coordination failure doesn't just delay help —<br />
              <span style={{ color: "#e63946" }}>it costs lives.</span>"
            </blockquote>
          </div>

          {/* Two-column: text + before/after cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "72px",
              alignItems: "start",
            }}
          >
            {/* Left */}
            <div>
              <h2
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "2rem",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: "20px",
                }}
              >
                BUILT FOR A<br />
                <span style={{ color: "#e63946" }}>REAL PROBLEM</span>
              </h2>
              <p
                style={{
                  color: "#8892a4",
                  lineHeight: 1.85,
                  marginBottom: "18px",
                  fontSize: "0.925rem",
                }}
              >
                During natural disasters, coordination failure kills people.
                Victims can't reach help. Volunteers don't know where to go.
                NGOs run out of supplies. Information is scattered across phone
                calls, WhatsApp groups, and spreadsheets.
              </p>
              <p
                style={{
                  color: "#8892a4",
                  lineHeight: 1.85,
                  fontSize: "0.925rem",
                }}
              >
                This platform was designed to eliminate that chaos — a single,
                structured system where every actor in a relief operation works
                from the same real-time data, with clear roles, live tracking,
                and a full audit trail.
              </p>
            </div>

            {/* Right: before / after */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                style={{
                  background: "rgba(230,57,70,0.05)",
                  border: "1px solid rgba(230,57,70,0.2)",
                  borderRadius: 10,
                  padding: "22px 24px",
                }}
              >
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.68rem",
                    color: "#e63946",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>✕</span> Without this platform
                </div>
                {[
                  "Victims unreachable by responders",
                  "Volunteers have no direction",
                  "Supply chain blind spots",
                  "Fragmented, phone-call coordination",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "0.83rem",
                      color: "#8892a4",
                      marginBottom: "9px",
                    }}
                  >
                    <span
                      style={{
                        color: "#e63946",
                        fontSize: "0.55rem",
                        flexShrink: 0,
                      }}
                    >
                      ■
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <div
                style={{
                  textAlign: "center",
                  color: "#4a5260",
                  fontSize: "1.1rem",
                }}
              >
                ↓
              </div>

              <div
                style={{
                  background: "rgba(46,204,113,0.05)",
                  border: "1px solid rgba(46,204,113,0.2)",
                  borderRadius: 10,
                  padding: "22px 24px",
                }}
              >
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.68rem",
                    color: "#2ecc71",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>✓</span> With this platform
                </div>
                {[
                  "GPS-tagged SOS with live tracking",
                  "Auto-dispatched nearest volunteer",
                  "Live inventory & supply alerts",
                  "One command centre for every actor",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "0.83rem",
                      color: "#8892a4",
                      marginBottom: "9px",
                    }}
                  >
                    <span
                      style={{
                        color: "#2ecc71",
                        fontSize: "0.55rem",
                        flexShrink: 0,
                      }}
                    >
                      ■
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: "1px solid #2a2f3a",
          background: "#0e1117",
          padding: "52px 40px 28px",
        }}      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Top 3-col row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 1fr",
              gap: "48px",
              marginBottom: "48px",
            }}
          >
            {/* Brand */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: "#e63946",
                    borderRadius: 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  🌊
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    DISASTER RESPONSE
                  </div>
                  <div
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: "0.58rem",
                      color: "#4a5260",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Relief Coordination Platform
                  </div>
                </div>
              </div>
              <p
                style={{
                  color: "#4a5260",
                  fontSize: "0.82rem",
                  lineHeight: 1.75,
                  maxWidth: "280px",
                }}
              >
                A real-time disaster coordination system connecting victims,
                volunteers, NGOs, and administrators during emergency events.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.65rem",
                  color: "#e63946",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "18px",
                }}
              >
                Navigation
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
                  { label: "Features", href: "#features", isAnchor: true },
                  { label: "How It Works", href: "#how", isAnchor: true },
                  { label: "About", href: "#about", isAnchor: true },
                  { label: "Sign In", href: "/login", isAnchor: false },
                  { label: "Register", href: "/register", isAnchor: false },
                ].map((item) =>
                  item.isAnchor ? (
                    <a
                      key={item.label}
                      href={item.href}
                      className="lp-nav-link"
                      style={{ width: "fit-content" }}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="lp-nav-link"
                      style={{ width: "fit-content" }}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </div>
            </div>

            {/* Tech stack */}
            <div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.65rem",
                  color: "#e63946",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "18px",
                }}
              >
                Built With
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  { icon: "⚛️", label: "React 18 + Vite" },
                  { icon: "🖥️", label: "Node.js + Express" },
                  { icon: "🍃", label: "MongoDB + Mongoose" },
                  { icon: "🔐", label: "JWT + bcryptjs" },
                  { icon: "🗺️", label: "Leaflet + OpenStreetMap" },
                ].map((t) => (
                  <div
                    key={t.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "0.9rem" }}>{t.icon}</span>
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "0.72rem",
                        color: "#4a5260",
                      }}
                    >
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: "1px solid #2a2f3a",
              paddingTop: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.67rem",
                color: "#4a5260",
                letterSpacing: "0.06em",
              }}
            >
              © 2025 · DISASTER RESPONSE PLATFORM
            </span>
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.67rem",
                color: "#4a5260",
                letterSpacing: "0.06em",
              }}
            >
              | SEC03 GROUP 05 |
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
