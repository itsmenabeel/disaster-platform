import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import NavTopBar from "../../components/NavTopBar";
import PriorityBadge from "../../components/PriorityBadge";
import { sortByPriorityDesc } from "../../utils/priority";

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-base)",
  },
  content: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 24px 60px",
  },
  pageTitle: {
    fontSize: "2rem",
    fontFamily: "Oswald, sans-serif",
    fontWeight: 700,
    marginBottom: "6px",
  },
  pageText: {
    color: "var(--text-secondary)",
    marginBottom: "24px",
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  navGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "24px",
  },
  navCard: (color) => ({
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "24px",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    transition: "border-color 0.18s ease, transform 0.18s ease",
    cursor: "pointer",
    color: "var(--text-primary)",
  }),
  navIcon: (color) => ({
    width: 50,
    height: 50,
    borderRadius: 10,
    flexShrink: 0,
    background: `${color}18`,
    border: `1px solid ${color}40`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4rem",
  }),
  navTitle: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.1rem",
    fontWeight: 600,
    letterSpacing: "0.03em",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  navDesc: { fontSize: "0.8rem", color: "var(--text-secondary)" },
  actionLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--bg-surface)",
    color: "var(--text-primary)",
    textDecoration: "none",
    fontWeight: 600,
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  },
  statCard: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "18px",
  },
  statValue: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.9rem",
    marginBottom: "6px",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(320px, 380px) minmax(0, 1fr)",
    gap: "18px",
    alignItems: "start",
  },
  lowerSectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "18px",
    alignItems: "start",
    marginTop: "18px",
  },
  section: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "20px",
  },
  sectionTitle: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.1rem",
    marginBottom: "12px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-primary)",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    minHeight: 110,
    resize: "vertical",
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-primary)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  button: {
    padding: "10px 16px",
    background: "var(--accent)",
    border: "none",
    borderRadius: "var(--radius)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  item: {
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "14px 16px",
    background: "var(--bg-elevated)",
  },
  itemTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  itemMeta: {
    color: "var(--text-secondary)",
    fontSize: "0.82rem",
    lineHeight: 1.5,
  },
  empty: {
    color: "var(--text-muted)",
    fontSize: "0.85rem",
  },
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [message, setMessage] = useState("");
  const [newIncident, setNewIncident] = useState({
    title: "",
    disasterType: "flood",
    address: "",
    description: "",
    startDate: "",
  });

  const loadData = async () => {
    const [incidentRes, analyticsRes, sosRes] = await Promise.all([
      api.get("/incidents"),
      api.get("/analytics/admin-summary"),
      api.get("/sos"),
    ]);

    setIncidents(incidentRes.data.data || []);
    setAnalytics(analyticsRes.data || {});
    setRequests(sosRes.data.data || []);
  };

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  const sortedRequests = sortByPriorityDesc(
    requests,
    (request) => request.priority,
    (request) => request.createdAt || request.date,
  );

  const createIncident = async () => {
    try {
      if (!newIncident.title || !newIncident.startDate) {
        alert("Title and Date required");
        return;
      }

      await api.post("/incidents", {
        title: newIncident.title,
        disasterType: newIncident.disasterType,
        address: newIncident.address,
        description: newIncident.description,
        startDate: newIncident.startDate,
        coordinates: [90.4, 23.7],
      });

      setNewIncident({
        title: "",
        disasterType: "flood",
        address: "",
        description: "",
        startDate: "",
      });

      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add incident");
    }
  };

  const sendBroadcast = async () => {
    try {
      if (!message.trim()) {
        alert("Enter a message");
        return;
      }

      await api.post("/notifications", {
        title: "Emergency Alert",
        message: message.trim(),
        targetRoles: ["all"],
      });

      setMessage("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send broadcast");
    }
  };

  return (
    <div style={styles.page}>
      <NavTopBar user={user} subtitle="ADMIN PORTAL" />

      <div style={styles.content}>
        <div style={styles.pageTitle}>Admin Dashboard</div>
        <div style={styles.pageText}>
          Broadcast alerts, manage incidents, and monitor priority requests.
        </div>

        <div style={styles.actions}>
          <Link to="/admin/incidents" style={styles.actionLink}>
            Incident Management
          </Link>
          <Link to="/admin/distribution" style={styles.actionLink}>
            Distribution Monitor
          </Link>
          <Link to="/admin/reports" style={styles.actionLink}>
            Analytics
          </Link>
        </div>

        <div style={styles.navGrid}>
          <Link
            to="/volunteer/map"
            style={styles.navCard("#3498db")}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3498db60";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={styles.navIcon("#3498db")}>🗺️</div>
            <div>
              <div style={{ ...styles.navTitle, color: "#3498db" }}>
                NEARBY MAP
              </div>
              <div style={styles.navDesc}>
                Browse SOS requests near your location
              </div>
            </div>
          </Link>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{analytics.total || 0}</div>
            <div style={styles.statLabel}>Total Incidents</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{analytics.active || 0}</div>
            <div style={styles.statLabel}>Active Incidents</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{analytics.critical || 0}</div>
            <div style={styles.statLabel}>Critical Incidents</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{requests.length}</div>
            <div style={styles.statLabel}>SOS Requests</div>
          </div>
        </div>

        <div style={styles.sectionGrid}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Emergency Broadcast</div>
            <div style={styles.form}>
              <textarea
                style={styles.textarea}
                placeholder="Enter broadcast message..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <button style={styles.button} onClick={sendBroadcast}>
                Send Broadcast
              </button>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Add Incident</div>
            <div style={styles.form}>
              <input
                style={styles.input}
                placeholder="Title"
                value={newIncident.title}
                onChange={(event) =>
                  setNewIncident((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />

              <select
                style={styles.input}
                value={newIncident.disasterType}
                onChange={(event) =>
                  setNewIncident((current) => ({
                    ...current,
                    disasterType: event.target.value,
                  }))
                }
              >
                <option value="flood">Flood</option>
                <option value="earthquake">Earthquake</option>
                <option value="fire">Fire</option>
                <option value="cyclone">Cyclone</option>
                <option value="landslide">Landslide</option>
                <option value="other">Other</option>
              </select>

              <input
                style={styles.input}
                placeholder="Location"
                value={newIncident.address}
                onChange={(event) =>
                  setNewIncident((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
              />

              <input
                type="date"
                style={styles.input}
                value={newIncident.startDate}
                onChange={(event) =>
                  setNewIncident((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
              />

              <textarea
                style={styles.textarea}
                placeholder="Description"
                value={newIncident.description}
                onChange={(event) =>
                  setNewIncident((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />

              <button style={styles.button} onClick={createIncident}>
                Add Incident
              </button>
            </div>
          </div>
        </div>

        <div style={styles.lowerSectionGrid}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Priority Requests</div>
            {requests.length === 0 ? (
              <div style={styles.empty}>No SOS requests found.</div>
            ) : (
              <div style={styles.list}>
                {sortedRequests.slice(0, 6).map((request) => (
                  <div key={request._id} style={styles.item}>
                    <div style={styles.itemTitle}>
                      <strong>{request.needs?.join(", ") || "Request"}</strong>
                      <PriorityBadge priority={request.priority} />
                    </div>
                    <div style={styles.itemMeta}>
                      Victim: {request.victim?.name || "Unknown"}
                      <br />
                      Status: {request.status}
                      <br />
                      Location: {request.address || "Not provided"}
                      <br />
                      Date: {new Date(request.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Recent Incidents</div>
            {incidents.length === 0 ? (
              <div style={styles.empty}>No incidents found.</div>
            ) : (
              <div style={styles.list}>
                {incidents.slice(0, 5).map((incident) => (
                  <div key={incident._id} style={styles.item}>
                    <div style={styles.itemTitle}>
                      <strong>{incident.title}</strong>
                      <span>{new Date(incident.startDate).toLocaleDateString()}</span>
                    </div>
                    <div style={styles.itemMeta}>
                      Type: {incident.disasterType}
                      <br />
                      Location: {incident.address || "Not provided"}
                      <br />
                      Description: {incident.description || "N/A"}
                    </div>
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

export default AdminDashboard;
