// src/components/MapLegend.jsx
import React from "react";
import "../css/NearbyMap.css";

const PRIORITY = {
  critical: { color: "#e63946", label: "CRITICAL" },
  high: { color: "#e67e22", label: "HIGH" },
  medium: { color: "#f39c12", label: "MEDIUM" },
  low: { color: "#2ecc71", label: "LOW" },
};

const MapLegend = () => (
  <div className="nm-legend">
    <div className="nm-legend__title">Legend</div>

    {/* Volunteer dot */}
    <div className="nm-legend__row">
      <div className="nm-legend__dot" style={{ background: "#3498db" }} />
      Your Location
    </div>

    {/* Priority dots */}
    {Object.values(PRIORITY).map((p) => (
      <div key={p.label} className="nm-legend__row">
        <div className="nm-legend__dot" style={{ background: p.color }} />
        {p.label} Priority
      </div>
    ))}
  </div>
);

export default MapLegend;
