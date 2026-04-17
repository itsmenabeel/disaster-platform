import { useAuth } from "../../context/AuthContext";

import NavTopBar from "../../components/NavTopBar";

const NGODashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      {/* Top bar */}
      <NavTopBar
        user={user}
        onBack={() => navigate("/ngo")}
        subtitle="NGO PORTAL"
      />
      <h1>NGODashboard</h1>
      <p>Under construction.</p>
    </div>
  );
};
export default NGODashboard;
