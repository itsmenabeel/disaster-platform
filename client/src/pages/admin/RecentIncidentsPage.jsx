import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import NavTopBar from "../../components/NavTopBar";

const styles = {
  page: { minHeight: "100vh", background: "var(--bg-base)" },
  content: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 24px 60px",
  },
  title: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "2rem",
    marginBottom: "8px",
  },
  text: {
    color: "var(--text-secondary)",
    marginBottom: "22px",
  },
  tabs: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  tab: (active) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: "var(--radius)",
    border: `1px solid ${active ? "rgba(46,204,113,0.35)" : "var(--border)"}`,
    background: active ? "rgba(46,204,113,0.12)" : "var(--bg-surface)",
    color: active ? "var(--success)" : "var(--text-primary)",
    textDecoration: "none",
    fontWeight: 600,
  }),
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
    flexWrap: "wrap",
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

const RecentIncidentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/incidents")
      .then((response) => setIncidents(response.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sortedIncidents = useMemo(
    () =>
      [...incidents].sort(
        (a, b) =>
          new Date(b.startDate || b.createdAt || 0) -
          new Date(a.startDate || a.createdAt || 0),
      ),
    [incidents],
  );

  return (
    <div style={styles.page}>
      <NavTopBar
        user={user}
        onBack={() => navigate("/admin")}
        subtitle="ADMIN PORTAL - RECENT INCIDENTS"
      />

      <div style={styles.content}>
        <div style={styles.title}>Recent Incidents</div>
        <div style={styles.text}>
          Latest incident records sorted by incident date.
        </div>

        <div style={styles.tabs}>
          <Link to="/admin/reports" style={styles.tab(false)}>
            Analytics
          </Link>
          <Link to="/admin/priority-requests" style={styles.tab(false)}>
            Priority Requests
          </Link>
          <Link to="/admin/recent-incidents" style={styles.tab(true)}>
            Recent Incidents
          </Link>
        </div>

        {loading ? (
          <div style={styles.empty}>Loading incidents...</div>
        ) : sortedIncidents.length === 0 ? (
          <div style={styles.empty}>No incidents found.</div>
        ) : (
          <div style={styles.list}>
            {sortedIncidents.map((incident) => (
              <div key={incident._id} style={styles.item}>
                <div style={styles.itemTitle}>
                  <strong>{incident.title}</strong>
                  <span>
                    {new Date(incident.startDate).toLocaleDateString()}
                  </span>
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
  );
};

export default RecentIncidentsPage;
