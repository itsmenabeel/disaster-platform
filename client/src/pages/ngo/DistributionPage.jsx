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
        <DistributionMonitor description="Review delivered aid records, victims helped, and the volunteer who handled each distribution." />
      </div>
    </div>
  );
};

export default DistributionPage;
