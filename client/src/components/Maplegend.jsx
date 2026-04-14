import React from "react";
import "../css/NearbyMap.css";

const PRIORITY = {
  critical: { color: "#e63946", label: "CRITICAL" },
  high: { color: "#e67e22", label: "HIGH" },
  medium: { color: "#f39c12", label: "MEDIUM" },
  low: { color: "#2ecc71", label: "LOW" },
};

const MapLegend = ({ role }) => (
  <div className="nm-legend">
    <div className="nm-legend__title">Legend</div>

    {/* Always show current location */}
    <div className="nm-legend__row">
      <div className="nm-legend__dot" style={{ background: "#3498db" }} />
      Your Location
    </div>

    {/* 🔵 Volunteer View */}
    {role === "volunteer" &&
      Object.values(PRIORITY).map((p) => (
        <div key={p.label} className="nm-legend__row">
          <div className="nm-legend__dot" style={{ background: p.color }} />
          {p.label} Priority
        </div>
      ))}

    {/* 🟢 Victim View */}
    {role === "victim" && (
      <>
        <div className="nm-legend__row">
          <div className="nm-legend__dot" style={{ background: "#2ecc71" }} />
          Active Camp
        </div>

        <div className="nm-legend__row">
          <div className="nm-legend__dot" style={{ background: "#95a5a6" }} />
          Inactive Camp
        </div>
      </>
    )}
  </div>
);

export default MapLegend;
