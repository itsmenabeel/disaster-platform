import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import NavTopBar from "../../components/NavTopBar";
import MessageThread from "../../components/MessageThread.jsx";
import PriorityBadge from "../../components/PriorityBadge";
import { sortByPriorityDesc } from "../../utils/priority";

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
  cancelled: {
    label: "Resolved by Issuer",
    color: "#e67e22",
    bg: "rgba(230,126,34,0.12)",
  },
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
  cancelledStrip: {
    padding: "12px 20px",
    background: "rgba(230,126,34,0.07)",
    borderTop: "1px solid rgba(230,126,34,0.25)",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    fontSize: "0.82rem",
    color: "#e67e22",
    lineHeight: 1.5,
  },
  cancelledIcon: {
    flexShrink: 0,
    marginTop: "1px",
  },
  cancelledReason: {
    flex: 1,
  },
  cancelledLabel: {
    fontSize: "0.68rem",
    fontFamily: "IBM Plex Mono, monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "3px",
    opacity: 0.8,
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
  distributionForm: {
    padding: "16px 20px",
    borderTop: "1px solid var(--border)",
    background: "rgba(46,204,113,0.06)",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 140px auto auto",
    gap: "10px",
    alignItems: "end",
  },
  distributionField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  distributionLabel: {
    fontSize: "0.72rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  distributionInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--bg-surface)",
    color: "var(--text-primary)",
  },
  distributionSubmit: {
    padding: "10px 16px",
    borderRadius: "var(--radius)",
    border: "1px solid rgba(46,204,113,0.35)",
    background: "rgba(46,204,113,0.18)",
    color: "#2ecc71",
    fontWeight: 600,
    cursor: "pointer",
  },
  distributionCancel: {
    padding: "10px 16px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--bg-surface)",
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
};

/* ─── Progress timeline helper ─── */
const STAGES = ["pending", "accepted", "on_the_way", "completed"];
const Timeline = ({ status }) => {
  if (status === "rejected" || status === "cancelled") return null;
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
  "cancelled",
];
const FILTER_LABELS = {
  all: "All",
  pending: "Pending",
  accepted: "Accepted",
  on_the_way: "On the Way",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Resolved by Issuer",
};

const MyTasks = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null); // task id being acted on
  const [completionTaskId, setCompletionTaskId] = useState(null);
  const [distributionForm, setDistributionForm] = useState({
    items: "",
    quantity: 1,
  });

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
    if (status === "completed") {
      setCompletionTaskId(taskId);
      return;
    }

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

  const handleDistributionSubmit = async (taskId) => {
    setActionLoading(taskId);

    try {
      await api.post("/distribution", {
        taskId,
        items: distributionForm.items,
        quantity: Number(distributionForm.quantity),
      });

      setCompletionTaskId(null);
      setDistributionForm({ items: "", quantity: 1 });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Distribution submission failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = sortByPriorityDesc(
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter),
    (task) => task.sosRequest?.priority,
    (task) =>
      task.sosRequest?.createdAt ||
      task.createdAt ||
      task.sosRequest?.date,
  );
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
                          <PriorityBadge priority={sos.priority} />
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

                {/* Rescue chat — visible while the volunteer has an active assignment */}
                {(task.status === "accepted" || task.status === "on_the_way") &&
                  sos?._id && (
                    <div style={{ padding: "0 20px 20px" }}>
                      <MessageThread sosId={sos._id} isActive={true} />
                    </div>
                  )}

                {/* Cancelled strip — shown when victim resolved the SOS before completion */}
                {task.status === "cancelled" && task.notes && (
                  <div style={styles.cancelledStrip}>
                    <span style={styles.cancelledIcon}>⚠️</span>
                    <div style={styles.cancelledReason}>
                      <div style={styles.cancelledLabel}>
                        SOS resolved by victim — reason
                      </div>
                      {task.notes
                        .replace(
                          /^SOS resolved by victim before completion\. Reason: "/,
                          "",
                        )
                        .replace(/"$/, "")}
                    </div>
                  </div>
                )}

                {/* Action footer — only for actionable statuses */}
                {completionTaskId === task._id && task.status === "on_the_way" && (
                  <div style={styles.distributionForm}>
                    <div style={styles.distributionField}>
                      <label style={styles.distributionLabel}>Items</label>
                      <input
                        type="text"
                        style={styles.distributionInput}
                        placeholder="Rice, water, medicine"
                        value={distributionForm.items}
                        onChange={(event) =>
                          setDistributionForm((current) => ({
                            ...current,
                            items: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div style={styles.distributionField}>
                      <label style={styles.distributionLabel}>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        style={styles.distributionInput}
                        value={distributionForm.quantity}
                        onChange={(event) =>
                          setDistributionForm((current) => ({
                            ...current,
                            quantity: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <button
                      type="button"
                      style={styles.distributionSubmit}
                      disabled={busy}
                      onClick={() => handleDistributionSubmit(task._id)}
                    >
                      {busy ? "Saving..." : "Submit"}
                    </button>

                    <button
                      type="button"
                      style={styles.distributionCancel}
                      onClick={() => {
                        setCompletionTaskId(null);
                        setDistributionForm({ items: "", quantity: 1 });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

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
