import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import NavTopBar from "../../components/NavTopBar";

const DistributionPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div>
      {/* Top bar */}
      <NavTopBar
        user={user}
        onBack={() => navigate("/ngo")}
        subtitle="NGO PORTAL - DISTRIBUTION PAGE"
      />
      <h1>DistributionPage</h1>
      <p>Under construction.</p>
    </div>
  );
};
export default DistributionPage;
