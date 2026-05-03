import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  title: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "2rem",
    marginBottom: "8px",
  },
  text: {
    color: "var(--text-secondary)",
    maxWidth: "720px",
  },
  refresh: {
    background: "rgba(52,152,219,0.14)",
    border: "1px solid rgba(52,152,219,0.35)",
    borderRadius: "var(--radius)",
    color: "var(--info)",
    padding: "10px 16px",
    fontSize: "0.86rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },
  statCard: (tone) => ({
    background: "var(--bg-surface)",
    border: `1px solid ${tone}`,
    borderRadius: "var(--radius-lg)",
    padding: "18px",
    boxShadow: "var(--shadow)",
  }),
  statValue: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.9rem",
    lineHeight: 1,
    marginBottom: "8px",
  },
  statLabel: {
    color: "var(--text-muted)",
    fontSize: "0.74rem",
    fontFamily: "IBM Plex Mono, monospace",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  panel: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    boxShadow: "var(--shadow)",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    borderBottom: "1px solid var(--border)",
    fontSize: "0.72rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  td: {
    padding: "16px",
    borderBottom: "1px solid var(--border)",
    color: "var(--text-primary)",
    fontSize: "0.88rem",
    verticalAlign: "top",
  },
  primary: {
    fontWeight: 700,
    marginBottom: "5px",
  },
  meta: {
    color: "var(--text-muted)",
    fontSize: "0.78rem",
    lineHeight: 1.45,
  },
  pill: (tone) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 9px",
    borderRadius: "999px",
    background: `${tone}18`,
    border: `1px solid ${tone}45`,
    color: tone,
    fontSize: "0.76rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  }),
  empty: {
    padding: "34px 18px",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  error: {
    border: "1px solid rgba(230,57,70,0.35)",
    background: "rgba(230,57,70,0.1)",
    color: "#ff8b96",
    borderRadius: "var(--radius)",
    padding: "12px 14px",
    marginBottom: "16px",
  },
};

const formatDate = (value) => {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString();
};

const formatItems = (record) => {
  const items = record.items || [];
  if (!items.length) return "N/A";

  return items
    .map((item) => {
      const name = item.itemName || "Item";
      const amount = [item.quantity, item.unit].filter(Boolean).join(" ");
      return amount ? `${name} (${amount})` : name;
    })
    .join(", ");
};

const getRecipientName = (record) =>
  record.victimId?.name ||
  record.recipientUser?.name ||
  record.recipient ||
  "Unknown victim";

const getVolunteerName = (record) =>
  record.volunteerId?.name || "Volunteer not recorded";

const DistributionMonitor = ({ description }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const loadRecords = async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    setFetching(true);
    setError("");

    try {
      const response = await api.get("/distribution");
      setRecords(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load distribution records.",
      );
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const stats = useMemo(() => {
    const volunteerIds = new Set();
    const victimIds = new Set();
    let totalQuantity = 0;

    records.forEach((record) => {
      if (record.volunteerId?._id) volunteerIds.add(record.volunteerId._id);
      if (record.victimId?._id || record.recipientUser?._id) {
        victimIds.add(record.victimId?._id || record.recipientUser?._id);
      }
      totalQuantity += Number(record.quantity || 0);
    });

    return {
      totalRecords: records.length,
      totalQuantity,
      volunteers: volunteerIds.size,
      victims: victimIds.size,
    };
  }, [records]);

  return (
    <>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Distribution Monitor</div>
          <div style={styles.text}>
            {description ||
              "Track aid delivered to victims and see which volunteer provided support."}
          </div>
        </div>

        <button
          type="button"
          style={styles.refresh}
          onClick={() => loadRecords()}
          disabled={fetching}
        >
          {fetching ? "Refreshing..." : "Refresh records"}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.statsGrid}>
        <div style={styles.statCard("rgba(52,152,219,0.28)")}>
          <div style={styles.statValue}>{stats.totalRecords}</div>
          <div style={styles.statLabel}>Distribution Records</div>
        </div>
        <div style={styles.statCard("rgba(46,204,113,0.28)")}>
          <div style={styles.statValue}>{stats.totalQuantity}</div>
          <div style={styles.statLabel}>Total Quantity Delivered</div>
        </div>
        <div style={styles.statCard("rgba(155,89,182,0.28)")}>
          <div style={styles.statValue}>{stats.volunteers}</div>
          <div style={styles.statLabel}>Helping Volunteers</div>
        </div>
        <div style={styles.statCard("rgba(243,156,18,0.28)")}>
          <div style={styles.statValue}>{stats.victims}</div>
          <div style={styles.statLabel}>Victims Helped</div>
        </div>
      </div>

      <div style={styles.panel}>
        {loading ? (
          <div style={styles.empty}>Loading distribution records...</div>
        ) : records.length === 0 ? (
          <div style={styles.empty}>No distribution records found.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Victim Helped</th>
                  <th style={styles.th}>Helped By Volunteer</th>
                  <th style={styles.th}>Items Delivered</th>
                  <th style={styles.th}>Relief Camp</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td style={styles.td}>
                      <div style={styles.primary}>{getRecipientName(record)}</div>
                      <div style={styles.meta}>
                        Recipient: {record.recipient || "Not recorded"}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.pill("#3498db")}>
                        {getVolunteerName(record)}
                      </span>
                      {record.volunteerId?.phone && (
                        <div style={{ ...styles.meta, marginTop: 6 }}>
                          {record.volunteerId.phone}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.primary}>{formatItems(record)}</div>
                      <div style={styles.meta}>
                        Total quantity: {record.quantity || 0}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {record.camp?.name || "No camp linked"}
                      {record.camp?.address && (
                        <div style={styles.meta}>{record.camp.address}</div>
                      )}
                    </td>
                    <td style={styles.td}>
                      {formatDate(record.date || record.distributedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default DistributionMonitor;
