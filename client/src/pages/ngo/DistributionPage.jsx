import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NavTopBar from "../../components/NavTopBar";
import DistributionMonitor from "../../components/DistributionMonitor";

const styles = {
  page: { minHeight: "100vh", background: "var(--bg-base)" },
  content: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "40px 24px 60px",
  },
  nav: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  navLink: (active) => ({
    padding: "10px 14px",
    borderRadius: "var(--radius)",
    border: `1px solid ${active ? "rgba(46, 204, 113, 0.35)" : "var(--border)"}`,
    background: active ? "rgba(46, 204, 113, 0.12)" : "var(--bg-surface)",
    color: active ? "var(--success)" : "var(--text-secondary)",
    fontSize: "0.85rem",
    fontWeight: 600,
    textDecoration: "none",
  }),
};

const DistributionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <NavTopBar
        user={user}
        onBack={() => navigate("/ngo")}
        subtitle="NGO PORTAL - DISTRIBUTION MONITOR"
      />

      <div style={styles.content}>
        <div style={styles.nav}>
          <Link to="/ngo" style={styles.navLink(false)}>
            Dashboard
          </Link>
          <Link to="/ngo/inventory" style={styles.navLink(false)}>
            Inventory
          </Link>
          <Link to="/ngo/camps" style={styles.navLink(false)}>
            Camps
          </Link>
          <Link to="/ngo/distribution" style={styles.navLink(true)}>
            Distribution
          </Link>
        </div>

        <DistributionMonitor description="Review delivered aid records, victims helped, and the volunteer who handled each distribution." />
      </div>
    </div>
  );
};

export default DistributionPage;
