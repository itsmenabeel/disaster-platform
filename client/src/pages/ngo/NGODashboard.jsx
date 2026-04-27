import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NavTopBar from "../../components/NavTopBar";

const styles = {
  page: { minHeight: "100vh", background: "var(--bg-base)" },
  content: {
    maxWidth: "980px",
    margin: "0 auto",
    padding: "40px 24px 60px",
  },
  heading: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "2rem",
    marginBottom: "8px",
  },
  subheading: {
    color: "var(--text-secondary)",
    marginBottom: "28px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },
  card: {
    display: "block",
    textDecoration: "none",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border)",
    background: "var(--bg-surface)",
    padding: "22px",
    color: "var(--text-primary)",
    boxShadow: "var(--shadow)",
  },
  title: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.2rem",
    marginBottom: "8px",
  },
  text: {
    color: "var(--text-secondary)",
    fontSize: "0.88rem",
    lineHeight: 1.5,
  },
};

const NGODashboard = () => {
  const { user } = useAuth();

  return (
    <div style={styles.page}>
      <NavTopBar user={user} subtitle="NGO PORTAL" />
      <div style={styles.content}>
        <div style={styles.heading}>NGO Dashboard</div>
        <div style={styles.subheading}>
          Manage camps and inventory, and review the shared incident history.
        </div>

        <div style={styles.grid}>
          <Link to="/ngo/inventory" style={styles.card}>
            <div style={styles.title}>Inventory</div>
            <div style={styles.text}>
              Update supply levels and monitor low-stock items.
            </div>
          </Link>

          <Link to="/ngo/camps" style={styles.card}>
            <div style={styles.title}>Camps</div>
            <div style={styles.text}>
              Manage camp capacity, occupancy, and field locations.
            </div>
          </Link>

          <Link to="/incidents" style={styles.card}>
            <div style={styles.title}>Incident History</div>
            <div style={styles.text}>
              Review incident titles, locations, dates, and descriptions.
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
