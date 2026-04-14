import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

/* ─────────────────────────────────────────────────────────────────
   Inject Leaflet dark-theme overrides once into <head>
   (Leaflet renders its own DOM outside React, so we must patch CSS)
───────────────────────────────────────────────────────────────── */
const injectMapStyles = () => {
  if (document.getElementById("nm-styles")) return;
  const el = document.createElement("style");
  el.id = "nm-styles";
  el.textContent = `
    /* Dark tooltip for SOS circles */
    .leaflet-tooltip.sos-tip {
      background: #111318 !important;
      border: 1px solid #2a2f3a !important;
      color: #eef0f4 !important;
      border-radius: 10px !important;
      padding: 0 !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
      pointer-events: none !important;
    }
    .leaflet-tooltip.sos-tip.leaflet-tooltip-top::before {
      border-top-color: #2a2f3a !important;
    }
    /* "You are here" tooltip */
    .leaflet-tooltip.vol-tip {
      background: rgba(52,152,219,0.92) !important;
      border: 1px solid #3498db !important;
      color: #fff !important;
      border-radius: 6px !important;
      font-family: 'IBM Plex Mono', monospace !important;
      font-size: 0.7rem !important;
      letter-spacing: 0.06em !important;
      padding: 4px 10px !important;
      white-space: nowrap !important;
    }
    .leaflet-tooltip.vol-tip::before { display: none !important; }
    /* Attribution + zoom controls */
    .leaflet-control-attribution {
      background: rgba(10,12,15,0.82) !important;
      color: #4a5260 !important;
      font-size: 0.58rem !important;
    }
    .leaflet-control-attribution a { color: #4a5260 !important; }
    .leaflet-control-zoom a {
      background: #111318 !important;
      color: #eef0f4 !important;
      border-color: #2a2f3a !important;
      transition: background 0.15s ease;
    }
    .leaflet-control-zoom a:hover { background: #181c23 !important; }
  `;
  document.head.appendChild(el);
};

/* ─────────────────────────────────────────────────────────────────
   Static config
───────────────────────────────────────────────────────────────── */
const NEED_EMOJIS = {
  food: "🍱",
  medicine: "💊",
  shelter: "🏠",
  water: "💧",
  clothing: "👕",
  other: "📦",
};

// Colour assigned to each SOS circle based on SOSRequest.priority
const PRIORITY = {
  critical: { color: "#e63946", label: "CRITICAL" },
  high: { color: "#e67e22", label: "HIGH" },
  medium: { color: "#f39c12", label: "MEDIUM" },
  low: { color: "#2ecc71", label: "LOW" },
};

const RADIUS_OPTIONS = [
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "20 km", value: 20000 },
  { label: "50 km", value: 50000 },
];

const timeAgo = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/* ─────────────────────────────────────────────────────────────────
   RecenterMap — child of MapContainer, smoothly re-centres the
   map whenever the volunteer's GPS coordinates are resolved
───────────────────────────────────────────────────────────────── */
const RecenterMap = ({ center }) => {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    if (!center) return;
    if (first.current) {
      map.setView(center, 14);
      first.current = false;
    } else {
      map.panTo(center);
    }
  }, [center, map]);
  return null;
};

/* ─────────────────────────────────────────────────────────────────
   NearbyMap component
   Data flow:
     1. Browser GPS  →  volunteer's [lat, lng]  (map centre only)
     2. GET /api/sos/nearby?lng=&lat=&radius=
        →  array of SOSRequest documents
     3. Each SOSRequest.location.coordinates ([lng, lat])
        →  one ColourCircleMarker on the map
     4. Hover the circle  →  Tooltip with SOS details
───────────────────────────────────────────────────────────────── */
const NearbyMap = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Volunteer's current GPS position — used ONLY for map centre + query
  const [myCoords, setMyCoords] = useState(null); // [lat, lng]
  const [gpsStatus, setGpsStatus] = useState("idle"); // idle|loading|success|error

  // SOS requests fetched from backend — circles come from these
  const [requests, setRequests] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const [radius, setRadius] = useState(20000);
  const mapRef = useRef(null);

  /* ── 1. Acquire volunteer GPS on mount ── */
  useEffect(() => {
    injectMapStyles();
    acquireGPS();
  }, []);

  const acquireGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyCoords([pos.coords.latitude, pos.coords.longitude]);
        setGpsStatus("success");
      },
      () => setGpsStatus("error"),
      { timeout: 12000 },
    );
  };

  /* ── 2. Fetch nearby SOS requests whenever coords or radius change ── */
  useEffect(() => {
    if (!myCoords) return;
    loadNearby();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myCoords, radius]);

  const loadNearby = async () => {
    if (!myCoords) return;
    setFetching(true);
    setFetchErr("");
    try {
      const [lat, lng] = myCoords;
      // API returns SOSRequest documents; each has location.coordinates [lng,lat]
      const res = await api.get(
        `/sos/nearby?lng=${lng}&lat=${lat}&radius=${radius}`,
      );
      setRequests(res.data.data || []);
      setUpdatedAt(new Date());
    } catch (err) {
      setFetchErr(err.response?.data?.message || "Failed to load requests.");
    } finally {
      setFetching(false);
    }
  };

  /* ── Derived counts for the stats strip ── */
  const counts = {
    total: requests.length,
    critical: requests.filter((r) => r.priority === "critical").length,
    high: requests.filter((r) => r.priority === "high").length,
    medium: requests.filter((r) => r.priority === "medium").length,
    low: requests.filter((r) => r.priority === "low").length,
  };

  const defaultCenter = [23.8103, 90.4125]; // Dhaka fallback
  const mapCenter = myCoords || defaultCenter;

  /* ──────────────────────────── Render ──────────────────────────── */
  return (
    <div
      style={{
        height: "100vh",
        background: "#0a0c0f",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ══════════════ TOP BAR ══════════════ */}
      <div
        style={{
          background: "#111318",
          borderBottom: "1px solid #2a2f3a",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: "#3498db",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            🗺️
          </div>
          <div>
            <div
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "1.05rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: "#eef0f4",
              }}
            >
              NEARBY SOS MAP
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#4a5260",
                fontFamily: "IBM Plex Mono, monospace",
              }}
            >
              VOLUNTEER PORTAL — LIVE DISPATCH VIEW
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user && (
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "IBM Plex Mono, monospace",
                color: "#4a5260",
              }}
            >
              {user.name}
            </span>
          )}
          <button
            onClick={() => navigate("/volunteer")}
            style={{
              background: "#181c23",
              border: "1px solid #2a2f3a",
              borderRadius: 6,
              padding: "7px 16px",
              color: "#8892a4",
              fontSize: "0.78rem",
              fontFamily: "Oswald, sans-serif",
              letterSpacing: "0.04em",
              cursor: "pointer",
            }}
          >
            ← BACK
          </button>
        </div>
      </div>

      {/* ══════════════ CONTROLS STRIP ══════════════ */}
      <div
        style={{
          background: "#111318",
          borderBottom: "1px solid #2a2f3a",
          padding: "10px 28px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        {/* Radius label */}
        <span
          style={{
            fontSize: "0.68rem",
            fontFamily: "IBM Plex Mono, monospace",
            color: "#4a5260",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Radius:
        </span>

        {/* Radius buttons */}
        <div style={{ display: "flex", gap: "6px" }}>
          {RADIUS_OPTIONS.map((opt) => {
            const active = radius === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setRadius(opt.value)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 20,
                  border: `1px solid ${active ? "#3498db" : "#2a2f3a"}`,
                  background: active ? "rgba(52,152,219,0.15)" : "#181c23",
                  color: active ? "#3498db" : "#8892a4",
                  fontSize: "0.78rem",
                  fontFamily: "Oswald, sans-serif",
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Refresh button */}
        <button
          onClick={loadNearby}
          disabled={!myCoords || fetching}
          style={{
            padding: "5px 16px",
            borderRadius: 20,
            border: "1px solid #2a2f3a",
            background: "#181c23",
            color: fetching ? "#4a5260" : "#8892a4",
            fontSize: "0.78rem",
            fontFamily: "Oswald, sans-serif",
            letterSpacing: "0.04em",
            cursor: myCoords && !fetching ? "pointer" : "not-allowed",
            transition: "all 0.15s ease",
          }}
        >
          {fetching ? "⟳ Loading..." : "⟳ REFRESH"}
        </button>

        {/* Last updated */}
        {updatedAt && (
          <span
            style={{
              fontSize: "0.68rem",
              fontFamily: "IBM Plex Mono, monospace",
              color: "#4a5260",
            }}
          >
            Updated {timeAgo(updatedAt)}
          </span>
        )}

        {/* Error message */}
        {fetchErr && (
          <span
            style={{
              fontSize: "0.72rem",
              fontFamily: "IBM Plex Mono, monospace",
              color: "#e63946",
            }}
          >
            {fetchErr}
          </span>
        )}

        {/* Stats chips — right side */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginLeft: "auto",
            flexWrap: "wrap",
          }}
        >
          {[
            { color: "#3498db", label: `${counts.total} TOTAL`, show: true },
            {
              color: "#e63946",
              label: `${counts.critical} CRITICAL`,
              show: counts.critical > 0,
            },
            {
              color: "#e67e22",
              label: `${counts.high} HIGH`,
              show: counts.high > 0,
            },
            {
              color: "#f39c12",
              label: `${counts.medium} MEDIUM`,
              show: counts.medium > 0,
            },
            {
              color: "#2ecc71",
              label: `${counts.low} LOW`,
              show: counts.low > 0,
            },
          ]
            .filter((c) => c.show)
            .map((c) => (
              <div
                key={c.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: `${c.color}15`,
                  border: `1px solid ${c.color}40`,
                  fontSize: "0.7rem",
                  fontFamily: "IBM Plex Mono, monospace",
                  color: c.color,
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: c.color,
                    flexShrink: 0,
                    animation:
                      c.color === "#e63946" && counts.critical > 0
                        ? "pulse-dot 1s infinite"
                        : "none",
                  }}
                />
                {c.label}
              </div>
            ))}
        </div>
      </div>

      {/* ══════════════ MAP AREA ══════════════ */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* GPS loading overlay */}
        {gpsStatus === "loading" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1000,
              background: "rgba(10,12,15,0.88)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
            }}
          >
            <div style={{ fontSize: "2.4rem" }}>📡</div>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.88rem",
                color: "#8892a4",
              }}
            >
              Acquiring GPS signal...
            </div>
          </div>
        )}

        {/* GPS error overlay */}
        {gpsStatus === "error" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1000,
              background: "rgba(10,12,15,0.88)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
            }}
          >
            <div style={{ fontSize: "2.4rem" }}>📍</div>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.82rem",
                color: "#e63946",
                textAlign: "center",
                maxWidth: 300,
                lineHeight: 1.6,
              }}
            >
              GPS access denied or unavailable.
              <br />
              Enable location permissions and try again.
            </div>
            <button
              onClick={acquireGPS}
              style={{
                marginTop: 6,
                padding: "10px 24px",
                background: "#3498db",
                border: "none",
                borderRadius: 6,
                color: "#fff",
                fontFamily: "Oswald, sans-serif",
                fontSize: "0.9rem",
                letterSpacing: "0.04em",
                cursor: "pointer",
              }}
            >
              RETRY LOCATION
            </button>
          </div>
        )}

        {/* ── Leaflet map (always rendered so tiles pre-load) ── */}
        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          {/*
            CartoDB Dark Matter tile layer.
            Matches the dark #0a0c0f theme — no jarring white background.
          */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />

          {/* Re-centre map once GPS resolves */}
          {myCoords && <RecenterMap center={myCoords} />}

          {/* ── Volunteer "You Are Here" circle ── */}
          {myCoords && (
            <CircleMarker
              center={myCoords}
              radius={13}
              pathOptions={{
                fillColor: "#3498db",
                fillOpacity: 0.92,
                color: "#ffffff",
                weight: 2.5,
              }}
            >
              <Tooltip direction="top" offset={[0, -15]} className="vol-tip">
                YOU ARE HERE
              </Tooltip>
            </CircleMarker>
          )}

          {/*
            ── SOS request circles ──
            SOURCE: SOSRequest.location.coordinates = [longitude, latitude]
            Leaflet expects [latitude, longitude] so we destructure + swap.
            Circle colour = SOSRequest.priority via PRIORITY config.
            Hover = Tooltip with full SOS details.
          */}
          {requests.map((req) => {
            const [lng, lat] = req.location.coordinates; // from SOSRequest model
            const p = PRIORITY[req.priority] || PRIORITY.medium;
            const urgent =
              req.priority === "critical" || req.priority === "high";

            return (
              <CircleMarker
                key={req._id}
                center={[lat, lng]} // Leaflet: [lat, lng]
                radius={urgent ? 15 : 11}
                pathOptions={{
                  fillColor: p.color,
                  fillOpacity: 0.85,
                  color: p.color,
                  weight: urgent ? 3 : 2,
                  opacity: 1,
                }}
                eventHandlers={{
                  click: () => navigate(`/volunteer/sos/${req._id}`),
                  mouseover: (e) => {
                    e.target.setStyle({
                      weight: urgent ? 5 : 4,
                      fillOpacity: 1,
                    });
                  },
                  mouseout: (e) => {
                    e.target.setStyle({
                      weight: urgent ? 3 : 2,
                      fillOpacity: 0.85,
                    });
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -12]} className="sos-tip">
                  {/* ── Tooltip inner card ── */}
                  <div
                    style={{
                      width: 230,
                      padding: "14px",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >
                    {/* Header row: ID + priority badge */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                        paddingBottom: 10,
                        borderBottom: "1px solid #2a2f3a",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "0.65rem",
                          color: "#4a5260",
                          letterSpacing: "0.08em",
                        }}
                      >
                        #{req._id.slice(-6).toUpperCase()}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: `${p.color}22`,
                          border: `1px solid ${p.color}55`,
                          fontSize: "0.62rem",
                          fontFamily: "IBM Plex Mono, monospace",
                          color: p.color,
                          letterSpacing: "0.08em",
                        }}
                      >
                        {p.label}
                      </span>
                    </div>

                    {/* Needs chips */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                        marginBottom: 10,
                      }}
                    >
                      {req.needs.map((n) => (
                        <span
                          key={n}
                          style={{
                            fontSize: "0.78rem",
                            padding: "2px 8px",
                            background: "#181c23",
                            border: "1px solid #2a2f3a",
                            borderRadius: 12,
                            color: "#8892a4",
                          }}
                        >
                          {NEED_EMOJIS[n] || "📦"} {n}
                        </span>
                      ))}
                    </div>

                    {/* Victim name */}
                    {req.victim?.name && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          fontSize: "0.78rem",
                          color: "#8892a4",
                          marginBottom: 5,
                          lineHeight: 1.45,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.62rem",
                            fontFamily: "IBM Plex Mono, monospace",
                            color: "#4a5260",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            flexShrink: 0,
                            paddingTop: 1,
                            minWidth: 52,
                          }}
                        >
                          Victim
                        </span>
                        <span>{req.victim.name}</span>
                      </div>
                    )}

                    {/* Address */}
                    {req.address && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          fontSize: "0.78rem",
                          color: "#8892a4",
                          marginBottom: 5,
                          lineHeight: 1.45,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.62rem",
                            fontFamily: "IBM Plex Mono, monospace",
                            color: "#4a5260",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            flexShrink: 0,
                            paddingTop: 1,
                            minWidth: 52,
                          }}
                        >
                          Address
                        </span>
                        <span>{req.address}</span>
                      </div>
                    )}

                    {/* Description */}
                    {req.description && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          fontSize: "0.78rem",
                          color: "#8892a4",
                          marginBottom: 5,
                          lineHeight: 1.45,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.62rem",
                            fontFamily: "IBM Plex Mono, monospace",
                            color: "#4a5260",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            flexShrink: 0,
                            paddingTop: 1,
                            minWidth: 52,
                          }}
                        >
                          Note
                        </span>
                        <span>
                          {req.description.length > 70
                            ? req.description.slice(0, 70) + "…"
                            : req.description}
                        </span>
                      </div>
                    )}

                    {/* GPS coordinates from SOSRequest.location.coordinates */}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        fontSize: "0.78rem",
                        color: "#8892a4",
                        marginBottom: 5,
                        lineHeight: 1.45,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.62rem",
                          fontFamily: "IBM Plex Mono, monospace",
                          color: "#4a5260",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          flexShrink: 0,
                          paddingTop: 1,
                          minWidth: 52,
                        }}
                      >
                        GPS
                      </span>
                      <span
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "0.72rem",
                        }}
                      >
                        {lat.toFixed(5)}°N, {lng.toFixed(5)}°E
                      </span>
                    </div>

                    {/* Footer: time ago */}
                    <div
                      style={{
                        marginTop: 10,
                        paddingTop: 8,
                        borderTop: "1px solid #2a2f3a",
                        fontSize: "0.65rem",
                        fontFamily: "IBM Plex Mono, monospace",
                        color: "#4a5260",
                      }}
                    >
                      🕐 Submitted {timeAgo(req.createdAt)}
                    </div>
                    {/* Click hint */}
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: "0.62rem",
                        fontFamily: "IBM Plex Mono, monospace",
                        color: "#3498db",
                        letterSpacing: "0.06em",
                        textAlign: "right",
                      }}
                    >
                      Click for full details →
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* ── My Location Button ── */}
        {myCoords && (
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView(myCoords, 14, { animate: true });
              }
            }}
            title="Center map on your location"
            style={{
              position: "absolute",
              bottom: 28,
              left: 12,
              zIndex: 500,
              background: "rgba(10,12,15,0.92)",
              border: "1px solid #3498db",
              borderRadius: 8,
              padding: "10px 16px",
              color: "#3498db",
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backdropFilter: "blur(8px)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(52,152,219,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(10,12,15,0.92)";
            }}
          >
            📍 MY LOCATION
          </button>
        )}

        {/* ── Legend (bottom-right) ── */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 12,
            zIndex: 500,
            background: "rgba(10,12,15,0.9)",
            border: "1px solid #2a2f3a",
            borderRadius: 8,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 7,
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              fontSize: "0.6rem",
              fontFamily: "IBM Plex Mono, monospace",
              color: "#4a5260",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Legend
          </div>

          {/* Volunteer dot */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.72rem",
              fontFamily: "IBM Plex Mono, monospace",
              color: "#8892a4",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#3498db",
                flexShrink: 0,
              }}
            />
            Your Location
          </div>

          {/* Priority dots */}
          {Object.values(PRIORITY).map((p) => (
            <div
              key={p.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.72rem",
                fontFamily: "IBM Plex Mono, monospace",
                color: "#8892a4",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: p.color,
                  flexShrink: 0,
                }}
              />
              {p.label} Priority
            </div>
          ))}
        </div>

        {/* ── No results card ── */}
        {gpsStatus === "success" && !fetching && requests.length === 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 500,
              background: "rgba(10,12,15,0.92)",
              border: "1px solid #2a2f3a",
              borderRadius: 10,
              padding: "22px 32px",
              textAlign: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>✅</div>
            <div
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "1rem",
                color: "#eef0f4",
                marginBottom: 4,
              }}
            >
              NO ACTIVE REQUESTS
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#4a5260",
                fontFamily: "IBM Plex Mono, monospace",
              }}
            >
              No pending SOS within{" "}
              {RADIUS_OPTIONS.find((r) => r.value === radius)?.label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyMap;
