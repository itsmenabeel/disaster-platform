import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/nearbyMap.css";

const TopBar = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <div>🗺️ NEARBY SOS MAP</div>

      <div>
        {user?.name}
        <button onClick={() => navigate("/volunteer")}>← BACK</button>
      </div>
    </div>
  );
};

export default TopBar;
