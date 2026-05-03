import React from "react";
import { useNavigate } from "react-router-dom";
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
};

const DistributionMonitorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <NavTopBar
        user={user}
        onBack={() => navigate("/admin")}
        subtitle="ADMIN PORTAL - DISTRIBUTION MONITOR"
      />

      <div style={styles.content}>
        <DistributionMonitor description="Monitor every volunteer-submitted aid delivery and confirm which victim received help from which volunteer." />
      </div>
    </div>
  );
};

export default DistributionMonitorPage;
