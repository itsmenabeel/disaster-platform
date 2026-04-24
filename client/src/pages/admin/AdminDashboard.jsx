import React, { useEffect, useState } from "react";
import api from "../../services/api";

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-base)",
  },

  topBar: {
    background: "var(--bg-surface)",
    borderBottom: "1px solid var(--border)",
    padding: "16px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  content: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 24px",
  },

  pageTitle: {
    fontSize: "2rem",
    fontFamily: "Oswald, sans-serif",
    fontWeight: 700,
    marginBottom: "20px",
  },

  section: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "20px",
    marginBottom: "16px",
  },

  sectionTitle: {
    fontFamily: "Oswald",
    fontSize: "1rem",
    marginBottom: "10px",
  },

  cardRow: {
    display: "flex",
    gap: "12px",
  },

  card: {
    flex: 1,
    padding: "16px",
    background: "var(--bg-input)",
    borderRadius: "var(--radius)",
  },

  input: {
    width: "100%",
    padding: "10px",
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-primary)",
  },

  button: {
    padding: "10px 16px",
    background: "var(--accent)",
    border: "none",
    borderRadius: "var(--radius)",
    color: "#fff",
    cursor: "pointer",
  },

  incidentItem: {
    borderBottom: "1px solid var(--border)",
    padding: "10px 0",
  },
};

const AdminDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [message, setMessage] = useState("");

  // ✅ ADMIN CHECK
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = true;

  // ✅ NEW INCIDENT STATE
  const [newIncident, setNewIncident] = useState({
    title: "",
    disasterType: "flood",
    description: "",
    startDate: "",
  });

  const loadData = async () => {
    const res = await api.get("/incidents");
    setIncidents(res.data.data || []);

    const a = await api.get("/analytics/admin-summary");
    setAnalytics(a.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const updatePriority = async (id, priority) => {
    await api.put(`/incidents/${id}/priority`, { priority });
    loadData();
  };

  // ✅ CREATE INCIDENT
  const createIncident = async () => {
    try {
      if (!newIncident.title || !newIncident.startDate) {
        return alert("Title and Date required");
      }

      await api.post("/incidents", {
        title: newIncident.title,
        disasterType: newIncident.disasterType,
        description: newIncident.description,
        startDate: newIncident.startDate,
        coordinates: [90.4, 23.7],
      });

      alert("Incident added ✅");

      setNewIncident({
        title: "",
        disasterType: "flood",
        description: "",
        startDate: "",
      });

      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to add incident");
    }
  };

  const sendBroadcast = async () => {
    try {
      if (!message) return alert("Enter message");

      await api.post("/notifications", {
        title: "Emergency Alert",
        message: message,
      });

      alert("Broadcast sent ✅");
      setMessage("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed ❌");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <h2>ADMIN CONTROL PANEL</h2>
      </div>

      <div style={styles.content}>
        <div style={styles.pageTitle}>Admin Dashboard</div>

        {/* Analytics */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Analytics</div>
          <div style={styles.cardRow}>
            <div style={styles.card}>Total: {analytics.total || 0}</div>
            <div style={styles.card}>Active: {analytics.active || 0}</div>
            <div style={styles.card}>Critical: {analytics.critical || 0}</div>
          </div>
        </div>

        {/* Broadcast */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Emergency Broadcast</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              style={styles.input}
              placeholder="Enter message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button style={styles.button} onClick={sendBroadcast}>
              Send
            </button>
          </div>
        </div>

        {/* ✅ ADD INCIDENT (ADMIN ONLY) */}
        {isAdmin && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Add Incident</div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                style={styles.input}
                placeholder="Title"
                value={newIncident.title}
                onChange={(e) =>
                  setNewIncident({ ...newIncident, title: e.target.value })
                }
              />

              <select
                style={styles.input}
                value={newIncident.disasterType}
                onChange={(e) =>
                  setNewIncident({
                    ...newIncident,
                    disasterType: e.target.value,
                  })
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
                type="date"
                style={styles.input}
                value={newIncident.startDate}
                onChange={(e) =>
                  setNewIncident({
                    ...newIncident,
                    startDate: e.target.value,
                  })
                }
              />

              <textarea
                style={styles.input}
                placeholder="Description"
                value={newIncident.description}
                onChange={(e) =>
                  setNewIncident({
                    ...newIncident,
                    description: e.target.value,
                  })
                }
              />

              <button style={styles.button} onClick={createIncident}>
                Add Incident
              </button>
            </div>
          </div>
        )}

        {/* Incidents */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Incident History</div>

          {incidents.length === 0 ? (
            <p>No incidents found</p>
          ) : (
            incidents.map((i) => (
              <div key={i._id} style={styles.incidentItem}>
                <strong>{i.title}</strong> ({i.disasterType})
                <br />
                Date: {new Date(i.startDate).toLocaleDateString()}
                <br />
                Description: {i.description || "N/A"}
                <br />
                Status: {i.status} | Priority: {i.priority || "low"}

                {/* ADMIN ONLY PRIORITY */}
                {isAdmin && (
                  <div style={{ marginTop: "6px" }}>
                    <select
                      value={i.priority || "low"}
                      onChange={(e) =>
                        updatePriority(i._id, e.target.value)
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;