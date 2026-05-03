import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import NavTopBar from "../../components/NavTopBar";
import HeaderTag from "../../components/HeaderTag";
import PriorityBadge from "../../components/PriorityBadge";
import LiveOperationsMap from "../../components/LiveOperationsMap";
import { sortByPriorityDesc } from "../../utils/priority";

const STATUS_META = {
  pending: { label: "Pending", color: "#f39c12" },
  assigned: { label: "Assigned", color: "#3498db" },
  on_the_way: { label: "On Way", color: "#9b59b6" },
  rescued: { label: "Rescued", color: "#2ecc71" },
  closed: { label: "Closed", color: "#8892a4" },
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
  rowMain: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  rowTitle: {
    color: "var(--text-primary)",
    overflowWrap: "anywhere",
  },
  rowMeta: {
    color: "var(--text-muted)",
    fontSize: "0.76rem",
    lineHeight: 1.45,
  },
  empty: {
    border: "1px dashed var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "28px",
    textAlign: "center",
    color: "var(--text-muted)",
  },
};

// const styles = {
//   page: { minHeight: "100vh", background: "var(--bg-base)" },
//   content: {
//     maxWidth: "980px",
//     margin: "0 auto",
//     padding: "40px 24px 60px",
//   },
//   heading: {
//     fontFamily: "Oswald, sans-serif",
//     fontSize: "2rem",
//     marginBottom: "8px",
//   },
//   subheading: {
//     color: "var(--text-secondary)",
//     marginBottom: "28px",
//   },
//   grid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
//     gap: "14px",
//   },
//   card: {
//     display: "block",
//     textDecoration: "none",
//     borderRadius: "var(--radius-lg)",
//     border: "1px solid var(--border)",
//     background: "var(--bg-surface)",
//     padding: "22px",
//     color: "var(--text-primary)",
//     boxShadow: "var(--shadow)",
//   },
//   title: {
//     fontFamily: "Oswald, sans-serif",
//     fontSize: "1.2rem",
//     marginBottom: "8px",
//   },
//   text: {
//     color: "var(--text-secondary)",
//     fontSize: "0.88rem",
//     lineHeight: 1.5,
//   },
// };

const NGODashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [camps, setCamps] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setFetching(true);
    setError("");

    try {
      const alertRes = await api.get("/inventory/alerts");
      setAlerts(alertRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load NGO dashboard.");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const interval = setInterval(() => loadDashboard(), 10000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  const handleMapData = useCallback(
    ({ requests: nextRequests, camps: nextCamps }) => {
      setRequests(nextRequests);
      setCamps(nextCamps);
    },
    [],
  );

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
      critical: requests.filter((request) => request.priority === "critical")
        .length,
      rescued: byStatus.rescued || 0,
    };
  }, [requests]);

  const sortedRequests = sortByPriorityDesc(
    requests,
    (request) => request.priority,
    (request) => request.createdAt || request.updatedAt,
  );
  const recentRequests = [...requests]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt),
    )
    .slice(0, 5);
  const criticalAlerts = sortedRequests
    .filter(
      (request) =>
        ["critical", "high"].includes(request.priority) &&
        !["rescued", "closed"].includes(request.status),
    )
    .slice(0, 5);

  const activeCamps = camps.filter((camp) => camp.isActive).length;

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
              refresh operational status automatically every 5 seconds.
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

        <LiveOperationsMap
          onData={handleMapData}
        />

        <div style={styles.bottomGrid}>
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Critical SOS Alerts</div>
            {criticalAlerts.length === 0 ? (
              <div style={styles.empty}>No critical or high SOS alerts.</div>
            ) : (
              <div style={styles.list}>
                {criticalAlerts.map((request) => {
                  const status =
                    STATUS_META[request.status] || STATUS_META.pending;
                  return (
                    <div key={request._id} style={styles.row}>
                      <div style={styles.rowMain}>
                        <span style={styles.rowTitle}>
                          #{request._id.slice(-6).toUpperCase()} -{" "}
                          {request.needs?.join(", ") || "No needs listed"}
                        </span>
                        <span style={styles.rowMeta}>
                          Victim: {request.victim?.name || "Unknown"} |{" "}
                          {request.address || "No address"} | {status.label}
                        </span>
                      </div>
                      <PriorityBadge priority={request.priority} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={styles.panel}>
            <div style={styles.panelTitle}>Recent SOS Requests</div>
            {recentRequests.length === 0 ? (
              <div style={styles.empty}>No SOS requests found.</div>
            ) : (
              <div style={styles.list}>
                {recentRequests.map((request) => {
                  const status =
                    STATUS_META[request.status] || STATUS_META.pending;
                  return (
                    <div key={request._id} style={styles.row}>
                      <div style={styles.rowMain}>
                        <span style={styles.rowTitle}>
                          #{request._id.slice(-6).toUpperCase()} -{" "}
                          {request.needs?.join(", ") || "No needs listed"}
                        </span>
                        <span style={styles.rowMeta}>
                          Victim: {request.victim?.name || "Unknown"} |{" "}
                          {request.address || "No address"}
                        </span>
                      </div>
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
