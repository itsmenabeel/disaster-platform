import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import NavTopBar from "../../components/NavTopBar";
import HeaderTag from "../../components/HeaderTag";
import "../../css/NearbyMap.css";

const STATUS_META = {
  pending: { label: "Pending", color: "#f39c12" },
  assigned: { label: "Assigned", color: "#3498db" },
  on_the_way: { label: "On Way", color: "#9b59b6" },
  rescued: { label: "Rescued", color: "#2ecc71" },
  closed: { label: "Closed", color: "#8892a4" },
};

const PRIORITY_META = {
  critical: { label: "Critical", color: "#e63946" },
  high: { label: "High", color: "#e67e22" },
  medium: { label: "Medium", color: "#f39c12" },
  low: { label: "Low", color: "#2ecc71" },
};

const styles = {
  page: { minHeight: "100vh", background: "var(--bg-base)" },
  shell: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "32px 24px 60px",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  title: {
    fontSize: "2.4rem",
    color: "var(--text-primary)",
    marginTop: "8px",
  },
  subtitle: {
    color: "var(--text-secondary)",
    maxWidth: "760px",
    fontSize: "0.95rem",
  },
  nav: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  navLink: (active) => ({
    padding: "10px 14px",
    borderRadius: "var(--radius)",
    border: `1px solid ${active ? "rgba(46, 204, 113, 0.35)" : "var(--border)"}`,
    background: active ? "rgba(46, 204, 113, 0.12)" : "var(--bg-surface)",
    color: active ? "var(--success)" : "var(--text-secondary)",
    fontSize: "0.85rem",
    fontWeight: 600,
  }),
  refresh: {
    background: "rgba(52,152,219,0.14)",
    border: "1px solid rgba(52,152,219,0.35)",
    borderRadius: "var(--radius)",
    color: "var(--info)",
    padding: "10px 16px",
    fontSize: "0.86rem",
    fontWeight: 600,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "14px",
  },
  statCard: (tone) => ({
    background: "var(--bg-surface)",
    border: `1px solid ${tone || "var(--border)"}`,
    borderRadius: "var(--radius-lg)",
    padding: "18px",
    boxShadow: "var(--shadow)",
  }),
  statLabel: {
    color: "var(--text-muted)",
    fontSize: "0.74rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px",
    fontFamily: "IBM Plex Mono, monospace",
  },
  statValue: {
    fontSize: "1.9rem",
    fontFamily: "Oswald, sans-serif",
    lineHeight: 1,
  },
  statHint: {
    color: "var(--text-secondary)",
    fontSize: "0.8rem",
    marginTop: "7px",
  },
  mapPanel: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    boxShadow: "var(--shadow)",
  },
  mapHeader: {
    padding: "16px 18px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
  },
  mapTitle: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.2rem",
    letterSpacing: "0.04em",
  },
  liveNote: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "var(--success)",
    fontSize: "0.72rem",
    fontFamily: "IBM Plex Mono, monospace",
    letterSpacing: "0.07em",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "var(--success)",
    animation: "pulse-dot 1s infinite",
  },
  mapWrap: {
    height: "520px",
    position: "relative",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "14px",
  },
  panel: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "18px",
  },
  panelTitle: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.1rem",
    marginBottom: "12px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    borderBottom: "1px solid var(--border)",
    paddingBottom: "9px",
    color: "var(--text-secondary)",
    fontSize: "0.86rem",
  },
  empty: {
    border: "1px dashed var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "28px",
    textAlign: "center",
    color: "var(--text-muted)",
  },
};

const FitToRequests = ({ requests }) => {
  const map = useMap();
  const hasAutoFit = useRef(false);

  useEffect(() => {
    if (hasAutoFit.current) return;

    const points = requests
      .map((request) => request.location?.coordinates)
      .filter((coords) => Array.isArray(coords) && coords.length === 2)
      .map(([lng, lat]) => [lat, lng]);

    if (points.length === 1) {
      map.setView(points[0], 12);
      hasAutoFit.current = true;
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [42, 42] });
      hasAutoFit.current = true;
    }
  }, [map, requests]);

  return null;
};

const formatTime = (value) =>
  value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Never";

const NGODashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [camps, setCamps] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const mapRef = useRef(null);

  const loadDashboard = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    setFetching(true);
    setError("");

    try {
      const [sosRes, campRes, alertRes] = await Promise.all([
        api.get("/sos"),
        api.get("/camps"),
        api.get("/inventory/alerts"),
      ]);

      setRequests(sosRes.data.data || []);
      setCamps(campRes.data.data || []);
      setAlerts(alertRes.data.data || []);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load NGO dashboard.");
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const interval = setInterval(() => loadDashboard({ quiet: true }), 10000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  const counts = useMemo(() => {
    const byStatus = requests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: requests.length,
      active: requests.filter((request) =>
        ["pending", "assigned", "on_the_way"].includes(request.status),
      ).length,
      pending: byStatus.pending || 0,
      critical: requests.filter((request) => request.priority === "critical").length,
      rescued: byStatus.rescued || 0,
    };
  }, [requests]);

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const activeCamps = camps.filter((camp) => camp.isActive).length;
  const center = [23.8103, 90.4125];

  return (
    <div style={styles.page}>
      <NavTopBar user={user} subtitle="NGO PORTAL - LIVE OPERATIONS" />

      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <HeaderTag subtitle="NGO RESOURCE & CAMP MANAGEMENT" />
            <h1 style={styles.title}>Live Response Dashboard</h1>
            <p style={styles.subtitle}>
              Monitor every SOS request on the map, keep camps visible, and
              refresh operational status automatically every 10 seconds.
            </p>
          </div>

          <button
            type="button"
            style={styles.refresh}
            onClick={() => loadDashboard()}
            disabled={fetching}
          >
            {fetching ? "Refreshing..." : "Refresh now"}
          </button>
        </div>

        <div style={styles.nav}>
          <Link to="/ngo" style={styles.navLink(true)}>
            Dashboard
          </Link>
          <Link to="/ngo/inventory" style={styles.navLink(false)}>
            Inventory
          </Link>
          <Link to="/ngo/camps" style={styles.navLink(false)}>
            Camps
          </Link>
          <Link to="/ngo/distribution" style={styles.navLink(false)}>
            Distribution
          </Link>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div style={styles.statsGrid}>
          <div style={styles.statCard("rgba(52,152,219,0.26)")}>
            <div style={styles.statLabel}>All SOS Requests</div>
            <div style={styles.statValue}>{counts.total}</div>
            <div style={styles.statHint}>Visible on live operations map</div>
          </div>
          <div style={styles.statCard("rgba(243,156,18,0.3)")}>
            <div style={styles.statLabel}>Active Requests</div>
            <div style={styles.statValue}>{counts.active}</div>
            <div style={styles.statHint}>Pending, assigned, or on the way</div>
          </div>
          <div style={styles.statCard("rgba(230,57,70,0.3)")}>
            <div style={styles.statLabel}>Critical Priority</div>
            <div style={styles.statValue}>{counts.critical}</div>
            <div style={styles.statHint}>Needs immediate coordination</div>
          </div>
          <div style={styles.statCard("rgba(46,204,113,0.26)")}>
            <div style={styles.statLabel}>Active Camps</div>
            <div style={styles.statValue}>{activeCamps}</div>
            <div style={styles.statHint}>Open relief locations</div>
          </div>
          <div style={styles.statCard("rgba(243,156,18,0.3)")}>
            <div style={styles.statLabel}>Shortage Alerts</div>
            <div style={styles.statValue}>{alerts.length}</div>
            <div style={styles.statHint}>Low-stock supply records</div>
          </div>
        </div>

        <div style={styles.mapPanel}>
          <div style={styles.mapHeader}>
            <div>
              <div style={styles.mapTitle}>All Requests On Map</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                Last updated {formatTime(updatedAt)}
              </div>
            </div>
            <div style={styles.liveNote}>
              <span style={styles.liveDot} />
              LIVE HTTP POLLING
            </div>
          </div>

          <div style={styles.mapWrap}>
            {loading ? (
              <div style={styles.empty}>Loading live map data...</div>
            ) : (
              <MapContainer
                ref={mapRef}
                center={center}
                zoom={7}
                style={{ height: "100%", width: "100%" }}
                zoomControl
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  subdomains="abcd"
                  maxZoom={20}
                />
                <FitToRequests requests={requests} />

                {requests.map((request) => {
                  const coords = request.location?.coordinates;
                  if (!Array.isArray(coords) || coords.length !== 2) return null;
                  const [lng, lat] = coords;
                  const status = STATUS_META[request.status] || STATUS_META.pending;
                  const priority = PRIORITY_META[request.priority] || PRIORITY_META.medium;
                  const isUrgent =
                    request.priority === "critical" || request.priority === "high";

                  return (
                    <CircleMarker
                      key={request._id}
                      center={[lat, lng]}
                      radius={isUrgent ? 15 : 11}
                      pathOptions={{
                        fillColor: priority.color,
                        fillOpacity: 0.84,
                        color: status.color,
                        weight: isUrgent ? 4 : 2,
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -12]} className="sos-tip">
                        <div>
                          <strong>#{request._id.slice(-6).toUpperCase()}</strong>
                          <br />
                          {request.needs?.join(", ") || "No needs listed"}
                          <br />
                          Status: {status.label}
                          <br />
                          Priority: {priority.label}
                          <br />
                          Victim: {request.victim?.name || "Unknown"}
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            )}
          </div>
        </div>

        <div style={styles.bottomGrid}>
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Recent SOS Requests</div>
            {recentRequests.length === 0 ? (
              <div style={styles.empty}>No SOS requests found.</div>
            ) : (
              <div style={styles.list}>
                {recentRequests.map((request) => {
                  const status = STATUS_META[request.status] || STATUS_META.pending;
                  return (
                    <div key={request._id} style={styles.row}>
                      <span>
                        #{request._id.slice(-6).toUpperCase()} -{" "}
                        {request.needs?.join(", ") || "No needs listed"}
                      </span>
                      <span style={{ color: status.color }}>{status.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={styles.panel}>
            <div style={styles.panelTitle}>Resource Shortage Alerts</div>
            {alerts.length === 0 ? (
              <div style={styles.empty}>No low-stock supply records.</div>
            ) : (
              <div style={styles.list}>
                {alerts.slice(0, 5).map((item) => (
                  <div key={item._id} style={styles.row}>
                    <span>{item.itemName}</span>
                    <span style={{ color: "var(--warning)" }}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
