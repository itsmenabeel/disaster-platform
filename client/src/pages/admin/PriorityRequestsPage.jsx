import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import NavTopBar from "../../components/NavTopBar";
import PriorityBadge from "../../components/PriorityBadge";

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
  priorityControl: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  prioritySelect: {
    minWidth: "118px",
    padding: "7px 10px",
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-primary)",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  empty: {
    color: "var(--text-muted)",
    fontSize: "0.85rem",
  },
};

const sortCriticalThenNewest = (items) =>
  [...items].sort((a, b) => {
    const aCritical = a.priority === "critical" ? 1 : 0;
    const bCritical = b.priority === "critical" ? 1 : 0;
    if (aCritical !== bCritical) return bCritical - aCritical;

    const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
    const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
    return dateB - dateA;
  });

const PriorityRequestsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prioritySaving, setPrioritySaving] = useState(null);

  const loadRequests = async () => {
    try {
      const response = await api.get("/analytics/live-map");
      setRequests(response.data.data?.requests || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const sortedRequests = useMemo(
    () => sortCriticalThenNewest(requests),
    [requests],
  );

  const updateRequestPriority = async (requestId, priority) => {
    setPrioritySaving(requestId);

    try {
      const response = await api.put(`/sos/${requestId}/priority`, {
        priority,
      });
      const updatedRequest = response.data.data;

      setRequests((current) =>
        current.map((request) =>
          request._id === requestId
                    ? { ...request, priority: updatedRequest.priority }
            : request,
        ),
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update priority");
    } finally {
      setPrioritySaving(null);
    }
  };

  return (
    <div style={styles.page}>
      <NavTopBar
        user={user}
        onBack={() => navigate("/admin")}
        subtitle="ADMIN PORTAL - PRIORITY REQUESTS"
      />

      <div style={styles.content}>
        <div style={styles.title}>Priority Requests</div>
        <div style={styles.text}>
          Critical requests are shown first. All other requests are sorted by
          newest creation time.
        </div>

        <div style={styles.tabs}>
          <Link to="/admin/reports" style={styles.tab(false)}>
            Analytics
          </Link>
          <Link to="/admin/priority-requests" style={styles.tab(true)}>
            Priority Requests
          </Link>
          <Link to="/admin/recent-incidents" style={styles.tab(false)}>
            Recent Incidents
          </Link>
        </div>

        {loading ? (
          <div style={styles.empty}>Loading SOS requests...</div>
        ) : sortedRequests.length === 0 ? (
          <div style={styles.empty}>No SOS requests found.</div>
        ) : (
          <div style={styles.list}>
            {sortedRequests.map((request) => (
              <div key={request._id} style={styles.item}>
                <div style={styles.itemTitle}>
                  <strong>{request.needs?.join(", ") || "Request"}</strong>
                  <div style={styles.priorityControl}>
                    <PriorityBadge priority={request.priority} />
                    <select
                      style={styles.prioritySelect}
                      value={request.priority || "medium"}
                      disabled={prioritySaving === request._id}
                      onChange={(event) =>
                        updateRequestPriority(request._id, event.target.value)
                      }
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
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
    </div>
  );
};

export default PriorityRequestsPage;
