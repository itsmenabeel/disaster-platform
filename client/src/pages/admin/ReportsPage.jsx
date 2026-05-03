import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import NavTopBar from "../../components/NavTopBar";

const chartColors = ["#e63946", "#f39c12", "#3498db", "#2ecc71", "#9b59b6"];

const styles = {
  page: { minHeight: "100vh", background: "var(--bg-base)" },
  content: {
    maxWidth: "1180px",
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
    marginBottom: "24px",
  },
  stats: {
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
    fontSize: "1.8rem",
    marginBottom: "6px",
  },
  statLabel: {
    color: "var(--text-muted)",
    fontSize: "0.74rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontFamily: "IBM Plex Mono, monospace",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },
  panel: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "18px",
    minHeight: 340,
  },
  panelTitle: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.1rem",
    marginBottom: "14px",
  },
  empty: {
    color: "var(--text-muted)",
    fontSize: "0.85rem",
  },
};

const normalizeChartData = (records = []) =>
  records.map((item) => ({
    name: item.name || item._id || "Unknown",
    value: item.count ?? item.totalDistributed ?? item.completedTasks ?? 0,
  }));

const ReportsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api
      .get("/analytics")
      .then((response) => setAnalytics(response.data.data))
      .catch(console.error);
  }, []);

  const statusData = normalizeChartData(analytics?.requestsByStatus);
  const priorityData = normalizeChartData(analytics?.requestsByPriority);
  const resourceData = normalizeChartData(analytics?.distributionByItem);
  const volunteerData = normalizeChartData(analytics?.volunteerActivity);

  return (
    <div style={styles.page}>
      <NavTopBar
        user={user}
        onBack={() => navigate("/admin")}
        subtitle="ADMIN ANALYTICS"
      />

      <div style={styles.content}>
        <div style={styles.title}>Analytics</div>
        <div style={styles.text}>
          Four charts only: request status, request priority, resource distribution, and volunteer activity.
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{analytics?.summary?.totalRequests || 0}</div>
            <div style={styles.statLabel}>Total Requests</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{analytics?.summary?.rescuedCount || 0}</div>
            <div style={styles.statLabel}>Rescued</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{analytics?.summary?.pendingCount || 0}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{analytics?.avgResponseTime || 0}m</div>
            <div style={styles.statLabel}>Avg Response Time</div>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Request Status</div>
            {statusData.length === 0 ? (
              <div style={styles.empty}>No SOS request data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={95} label>
                    {statusData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={styles.panel}>
            <div style={styles.panelTitle}>Request Priority</div>
            {priorityData.length === 0 ? (
              <div style={styles.empty}>No priority data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f39c12" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={styles.panel}>
            <div style={styles.panelTitle}>Resource Distribution</div>
            {resourceData.length === 0 ? (
              <div style={styles.empty}>No distribution data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={resourceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2ecc71" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={styles.panel}>
            <div style={styles.panelTitle}>Volunteer Activity</div>
            {volunteerData.length === 0 ? (
              <div style={styles.empty}>No volunteer activity data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={volunteerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3498db" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
