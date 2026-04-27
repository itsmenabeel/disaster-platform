import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  panel: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    borderBottom: "1px solid var(--border)",
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid var(--border)",
    color: "var(--text-primary)",
    fontSize: "0.88rem",
    verticalAlign: "top",
  },
  empty: {
    padding: "18px 16px",
    color: "var(--text-muted)",
  },
};

const DistributionMonitorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api
      .get("/distribution")
      .then((response) => setRecords(response.data.data || []))
      .catch(console.error);
  }, []);

  return (
    <div style={styles.page}>
      <NavTopBar
        user={user}
        onBack={() => navigate("/admin")}
        subtitle="DISTRIBUTION MONITOR"
      />

      <div style={styles.content}>
        <div style={styles.title}>Distribution Records</div>
        <div style={styles.text}>
          Read-only monitoring for volunteer-submitted distribution updates.
        </div>

        <div style={styles.panel}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Victim</th>
                <th style={styles.th}>Items Received</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td style={styles.empty} colSpan={4}>
                    No distribution records found.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id}>
                    <td style={styles.td}>
                      {record.victimId?.name ||
                        record.recipientUser?.name ||
                        record.recipient ||
                        "Unknown"}
                    </td>
                    <td style={styles.td}>
                      {record.items?.map((item) => item.itemName).filter(Boolean).join(", ") ||
                        "N/A"}
                    </td>
                    <td style={styles.td}>{record.quantity || record.items?.[0]?.quantity || 0}</td>
                    <td style={styles.td}>
                      {new Date(record.date || record.distributedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DistributionMonitorPage;
