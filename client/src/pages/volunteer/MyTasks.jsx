import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import NavTopBar from "../../components/NavTopBar";

/* ─── Status config ─── */
const STATUS_META = {
  pending: {
    label: "Pending Response",
    color: "#f39c12",
    bg: "rgba(243,156,18,0.12)",
  },
  accepted: {
    label: "Accepted",
    color: "#3498db",
    bg: "rgba(52,152,219,0.12)",
  },
  on_the_way: {
    label: "On the Way",
    color: "#9b59b6",
    bg: "rgba(155,89,182,0.12)",
  },
  completed: {
    label: "Completed ✓",
    color: "#2ecc71",
    bg: "rgba(46,204,113,0.12)",
  },
  rejected: { label: "Rejected", color: "#e63946", bg: "rgba(230,57,70,0.12)" },
};

/* ─── Which next statuses are allowed from each current status ─── */
const NEXT_STATUS = {
  accepted: [{ value: "on_the_way", label: "🚗 Mark On the Way" }],
  on_the_way: [{ value: "completed", label: "✓ Mark Completed" }],
};

/* ─── Styles ─── */
const styles = {
  page: { minHeight: "100vh", background: "var(--bg-base)" },

  content: {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "40px 24px 60px",
    animation: "fadeUp 0.4s ease both",
  },
  pageHeader: { marginBottom: "28px" },
  tag: {
    display: "inline-block",
    background: "rgba(52,152,219,0.12)",
    border: "1px solid rgba(52,152,219,0.3)",
    borderRadius: "4px",
    padding: "3px 10px",
    fontSize: "0.7rem",
    fontFamily: "IBM Plex Mono, monospace",
    color: "#3498db",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  pageTitle: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "2rem",
    fontWeight: 700,
    marginBottom: "4px",
  },
  pageSub: { color: "var(--text-secondary)", fontSize: "0.875rem" },

  /* Filter tabs */
  filterRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  filterBtn: (active) => ({
    padding: "7px 16px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontFamily: "Oswald, sans-serif",
    letterSpacing: "0.04em",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid",
    background: active ? "var(--accent)" : "var(--bg-surface)",
    borderColor: active ? "var(--accent)" : "var(--border)",
    color: active ? "#fff" : "var(--text-secondary)",
    transition: "all 0.15s ease",
  }),

  /* Task card */
  card: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    marginBottom: "14px",
    overflow: "hidden",
    transition: "border-color 0.18s ease",
  },
  cardTop: {
    padding: "18px 20px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
  },
  cardLeft: { flex: 1, minWidth: 0 },
  cardId: {
    fontSize: "0.72rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  cardNeeds: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.1rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
    marginBottom: "6px",
  },
  infoRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
  infoItem: { display: "flex", alignItems: "center", gap: "5px" },
  statusBadge: (status) => ({
    padding: "5px 14px",
    borderRadius: "20px",
    flexShrink: 0,
    fontSize: "0.78rem",
    fontFamily: "Oswald, sans-serif",
    letterSpacing: "0.04em",
    fontWeight: 600,
    whiteSpace: "nowrap",
    color: STATUS_META[status]?.color || "var(--text-secondary)",
    background: STATUS_META[status]?.bg || "var(--bg-elevated)",
  }),

  /* Card description strip */
  descStrip: {
    padding: "10px 20px",
    background: "var(--bg-elevated)",
    borderTop: "1px solid var(--border)",
    fontSize: "0.82rem",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
    fontStyle: "italic",
  },

  /* Action footer */
  cardFooter: {
    padding: "14px 20px",
    borderTop: "1px solid var(--border)",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    background: "var(--bg-elevated)",
  },
  acceptBtn: {
    padding: "9px 20px",
    borderRadius: "var(--radius)",
    background: "rgba(46,204,113,0.15)",
    border: "1px solid rgba(46,204,113,0.4)",
    color: "#2ecc71",
    fontSize: "0.85rem",
    fontFamily: "Oswald, sans-serif",
    letterSpacing: "0.05em",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  rejectBtn: {
    padding: "9px 20px",
    borderRadius: "var(--radius)",
    background: "rgba(230,57,70,0.12)",
    border: "1px solid rgba(230,57,70,0.35)",
    color: "var(--accent)",
    fontSize: "0.85rem",
    fontFamily: "Oswald, sans-serif",
    letterSpacing: "0.05em",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  progressBtn: {
    padding: "9px 20px",
    borderRadius: "var(--radius)",
    background: "rgba(52,152,219,0.15)",
    border: "1px solid rgba(52,152,219,0.4)",
    color: "#3498db",
    fontSize: "0.85rem",
    fontFamily: "Oswald, sans-serif",
    letterSpacing: "0.05em",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  actionNote: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
    marginLeft: "auto",
  },

  /* Status timeline dots */
  timeline: {
    display: "flex",
    alignItems: "center",
    gap: "0",
    marginLeft: "auto",
  },
  timelineDot: (active, done) => ({
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: done ? "#2ecc71" : active ? "#3498db" : "var(--bg-elevated)",
    border: `2px solid ${done ? "#2ecc71" : active ? "#3498db" : "var(--border)"}`,
    flexShrink: 0,
  }),
  timelineLine: (done) => ({
    width: 24,
    height: 2,
    background: done ? "#2ecc71" : "var(--border)",
  }),

  emptyState: {
    background: "var(--bg-surface)",
    border: "1px dashed var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "48px",
    textAlign: "center",
  },
  emptyIcon: { fontSize: "2.5rem", marginBottom: "12px" },
  emptyText: {
    color: "var(--text-muted)",
    fontSize: "0.875rem",
    marginBottom: "16px",
  },
};

/* ─── Progress timeline helper ─── */
const STAGES = ["pending", "accepted", "on_the_way", "completed"];
const Timeline = ({ status }) => {
  if (status === "rejected") return null;
  const idx = STAGES.indexOf(status);
  return (
    <div style={styles.timeline}>
      {STAGES.map((s, i) => (
        <React.Fragment key={s}>
          <div
            style={styles.timelineDot(i === idx, i < idx)}
            title={STATUS_META[s]?.label}
          />
          {i < STAGES.length - 1 && (
            <div style={styles.timelineLine(i < idx)} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const FILTERS = [
  "all",
  "pending",
  "accepted",
  "on_the_way",
  "completed",
  "rejected",
];
const FILTER_LABELS = {
  all: "All",
  pending: "Pending",
  accepted: "Accepted",
  on_the_way: "On the Way",
  completed: "Completed",
  rejected: "Rejected",
};

const MyTasks = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null); // task id being acted on

  const fetchTasks = () => {
    setLoading(true);
    api
      .get("/tasks")
      .then((res) => setTasks(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRespond = async (taskId, action) => {
    setActionLoading(taskId);
    try {
      await api.put(`/tasks/${taskId}/respond`, { action });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    setActionLoading(taskId);
    try {
      await api.put(`/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const isActing = (id) => actionLoading === id;

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <NavTopBar
        user={user}
        onBack={() => navigate("/volunteer")}
        subtitle="VOLUNTEER PORTAL — RESCUE TASK VIEW"
      />

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <div style={styles.tag}>⬤ VOLUNTEER — TASK MANAGEMENT</div>
          <div style={styles.pageTitle}>My Rescue Tasks</div>
          <div style={styles.pageSub}>
            Accept, reject, and update the status of your assigned rescue
            missions.
          </div>
        </div>

        {/* Filter tabs */}
        <div style={styles.filterRow}>
          {FILTERS.map((f) => {
            const count =
              f === "all"
                ? tasks.length
                : tasks.filter((t) => t.status === f).length;
            return (
              <button
                key={f}
                style={styles.filterBtn(filter === f)}
                onClick={() => setFilter(f)}
              >
                {FILTER_LABELS[f]}
                {count > 0 && (
                  <span
                    style={{
                      marginLeft: "6px",
                      background:
                        filter === f
                          ? "rgba(255,255,255,0.25)"
                          : "var(--bg-elevated)",
                      borderRadius: "10px",
                      padding: "1px 7px",
                      fontSize: "0.72rem",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Task list */}
        {loading ? (
          <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Loading tasks...
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <div style={styles.emptyText}>
              {filter === "all"
                ? "No tasks assigned yet. Browse the map to find nearby SOS requests."
                : `No ${FILTER_LABELS[filter].toLowerCase()} tasks.`}
            </div>
            {filter === "all" && (
              <Link
                to="/volunteer/map"
                className="btn-primary"
                style={{
                  display: "inline-flex",
                  width: "auto",
                  padding: "10px 24px",
                }}
              >
                🗺️ VIEW MAP
              </Link>
            )}
          </div>
        ) : (
          filtered.map((task) => {
            const sos = task.sosRequest;
            const victim = sos?.victim;
            const busy = isActing(task._id);
            const nextStatuses = NEXT_STATUS[task.status] || [];

            return (
              <div
                key={task._id}
                style={{
                  ...styles.card,
                  borderColor:
                    task.status === "pending"
                      ? "rgba(243,156,18,0.4)"
                      : "var(--border)",
                }}
              >
                {/* Card top */}
                <div style={styles.cardTop}>
                  <div style={styles.cardLeft}>
                    <div style={styles.cardId}>
                      <span>TASK #{task._id.slice(-8).toUpperCase()}</span>
                      <span>·</span>
                      <span>
                        SOS #{sos?._id?.slice(-8).toUpperCase() || "—"}
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={styles.cardNeeds}>
                      {sos?.needs
                        ?.map((n) => n.charAt(0).toUpperCase() + n.slice(1))
                        .join(" · ") || "Unknown needs"}
                    </div>

                    <div style={styles.infoRow}>
                      {victim?.name && (
                        <div style={styles.infoItem}>
                          <span>👤</span>
                          <span>{victim.name}</span>
                        </div>
                      )}
                      {victim?.phone && (
                        <div style={styles.infoItem}>
                          <span>📞</span>
                          <span>{victim.phone}</span>
                        </div>
                      )}
                      {sos?.address && (
                        <div style={styles.infoItem}>
                          <span>📍</span>
                          <span>{sos.address}</span>
                        </div>
                      )}
                      {sos?.priority && (
                        <div style={styles.infoItem}>
                          <span>🚨</span>
                          <span
                            style={{
                              color:
                                sos.priority === "critical"
                                  ? "#e63946"
                                  : sos.priority === "high"
                                    ? "#f39c12"
                                    : "var(--text-muted)",
                              fontWeight:
                                sos.priority === "critical" ? 600 : 400,
                              textTransform: "capitalize",
                            }}
                          >
                            {sos.priority}
                          </span>
                        </div>
                      )}
                      {task.acceptedAt && (
                        <div style={styles.infoItem}>
                          <span>✅</span>
                          <span>
                            Accepted{" "}
                            {new Date(task.acceptedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      {task.completedAt && (
                        <div style={styles.infoItem}>
                          <span>🏁</span>
                          <span>
                            Completed{" "}
                            {new Date(task.completedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "10px",
                      flexShrink: 0,
                    }}
                  >
                    <div style={styles.statusBadge(task.status)}>
                      {STATUS_META[task.status]?.label || task.status}
                    </div>
                    <Timeline status={task.status} />
                  </div>
                </div>

                {/* Description strip */}
                {sos?.description && (
                  <div style={styles.descStrip}>"{sos.description}"</div>
                )}

                {/* Action footer — only for actionable statuses */}
                {(task.status === "pending" || nextStatuses.length > 0) && (
                  <div style={styles.cardFooter}>
                    {task.status === "pending" && (
                      <>
                        <button
                          style={styles.acceptBtn}
                          disabled={busy}
                          onClick={() => handleRespond(task._id, "accept")}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(46,204,113,0.25)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "rgba(46,204,113,0.15)";
                          }}
                        >
                          {busy ? "Processing..." : "✓ ACCEPT TASK"}
                        </button>
                        <button
                          style={styles.rejectBtn}
                          disabled={busy}
                          onClick={() => handleRespond(task._id, "reject")}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(230,57,70,0.22)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "rgba(230,57,70,0.12)";
                          }}
                        >
                          {busy ? "..." : "✕ REJECT"}
                        </button>
                        <span style={styles.actionNote}>
                          Respond to this assignment
                        </span>
                      </>
                    )}

                    {nextStatuses.map((ns) => (
                      <button
                        key={ns.value}
                        style={styles.progressBtn}
                        disabled={busy}
                        onClick={() => handleStatusUpdate(task._id, ns.value)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(52,152,219,0.28)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(52,152,219,0.15)";
                        }}
                      >
                        {busy ? "Updating..." : ns.label}
                      </button>
                    ))}

                    {nextStatuses.length > 0 && (
                      <span style={styles.actionNote}>
                        {task.status === "accepted"
                          ? "Begin your journey to victim"
                          : "Confirm rescue complete"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyTasks;
