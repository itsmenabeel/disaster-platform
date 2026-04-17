import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import NavTopBar from "../../components/NavTopBar";
import HeaderTag from "../../components/HeaderTag";

const styles = {
  page: { minHeight: "100vh", background: "var(--bg-base)" },
  content: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 24px 60px",
    animation: "fadeUp 0.4s ease both",
  },
  greeting: { marginBottom: "32px" },
  greetingTitle: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.9rem",
    fontWeight: 700,
    marginBottom: "4px",
  },
  greetingSub: { color: "var(--text-secondary)", fontSize: "0.9rem" },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "28px",
  },
  statCard: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "20px",
  },
  statValue: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "0.72rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  navGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "28px",
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
  },
  navDesc: { fontSize: "0.8rem", color: "var(--text-secondary)" },
  sectionTitle: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    color: "var(--text-secondary)",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  recentCard: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "16px 20px",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  taskId: {
    fontSize: "0.72rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
    marginBottom: "4px",
  },
  taskNeeds: { fontSize: "0.88rem", fontWeight: 500, marginBottom: "2px" },
  taskDate: { fontSize: "0.75rem", color: "var(--text-muted)" },
  emptyState: {
    background: "var(--bg-surface)",
    border: "1px dashed var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "32px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "0.875rem",
  },
};

const STATUS_COLOR = {
  pending: "#f39c12",
  accepted: "#3498db",
  on_the_way: "#9b59b6",
  completed: "#2ecc71",
  rejected: "#e63946",
};

const STATUS_LABEL = {
  pending: "Pending",
  accepted: "Accepted",
  on_the_way: "On the Way",
  completed: "Completed",
  rejected: "Rejected",
};

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/tasks")
      .then((res) => setTasks(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    active: tasks.filter((t) => ["accepted", "on_the_way"].includes(t.status))
      .length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  const recent = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <NavTopBar user={user} subtitle="VOLUNTEER PORTAL" />

      <div style={styles.content}>
        <HeaderTag subtitle="⬤ VOLUNTEER — DASHBOARD" />
        {/* Greeting */}
        <div style={styles.greeting}>
          <div style={styles.greetingTitle}>
            Hello, {user?.name?.split(" ")[0]} 👋
          </div>
          <div style={styles.greetingSub}>
            Here's your rescue operations overview.
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            {
              label: "Total Tasks",
              value: counts.total,
              color: "var(--text-primary)",
            },
            { label: "Pending", value: counts.pending, color: "#f39c12" },
            { label: "Active", value: counts.active, color: "#3498db" },
            {
              label: "Completed",
              value: counts.completed,
              color: "var(--success)",
            },
          ].map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={{ ...styles.statValue, color: s.color }}>
                {s.value}
              </div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Nav cards */}
        <div style={styles.navGrid}>
          {[
            {
              to: "/volunteer/tasks",
              icon: "📋",
              color: "#e63946",
              title: "MY TASKS",
              desc: "Accept, reject, and update your rescue assignments",
            },
            {
              to: "/volunteer/map",
              icon: "🗺️",
              color: "#3498db",
              title: "NEARBY MAP",
              desc: "Browse SOS requests near your location",
            },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              style={styles.navCard(c.color)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${c.color}60`;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={styles.navIcon(c.color)}>{c.icon}</div>
              <div>
                <div style={{ ...styles.navTitle, color: c.color }}>
                  {c.title}
                </div>
                <div style={styles.navDesc}>{c.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent tasks */}
        <div style={styles.sectionTitle}>
          🕐 RECENT TASKS
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 400,
              fontFamily: "IBM Plex Mono, monospace",
            }}
          >
            ({tasks.length})
          </span>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Loading tasks...
          </div>
        ) : recent.length === 0 ? (
          <div style={styles.emptyState}>
            No tasks assigned yet. Check the map for nearby SOS requests.
          </div>
        ) : (
          recent.map((task) => {
            const sos = task.sosRequest;
            return (
              <div key={task._id} style={styles.recentCard}>
                <div>
                  <div style={styles.taskId}>
                    #{task._id.slice(-8).toUpperCase()}
                  </div>
                  <div style={styles.taskNeeds}>
                    {sos?.needs?.join(", ") || "—"}
                  </div>
                  <div style={styles.taskDate}>
                    {new Date(task.createdAt).toLocaleString()}
                  </div>
                </div>
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.78rem",
                    fontFamily: "Oswald, sans-serif",
                    letterSpacing: "0.04em",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    color: STATUS_COLOR[task.status],
                    background: `${STATUS_COLOR[task.status]}18`,
                  }}
                >
                  {STATUS_LABEL[task.status]}
                </div>
              </div>
            );
          })
        )}
        {recent.length > 0 && (
          <Link
            to="/volunteer/tasks"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: "12px",
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              fontFamily: "IBM Plex Mono, monospace",
            }}
          >
            VIEW ALL TASKS →
          </Link>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
