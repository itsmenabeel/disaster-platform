import React from "react";

const ControlBar = ({ radius, setRadius, loadNearby, fetching, counts }) => {
  const RADIUS_OPTIONS = [
    { label: "5 km", value: 5000 },
    { label: "10 km", value: 10000 },
    { label: "20 km", value: 20000 },
  ];

  return (
    <div className="control-bar">
      {RADIUS_OPTIONS.map((opt) => (
        <button key={opt.value} onClick={() => setRadius(opt.value)}>
          {opt.label}
        </button>
      ))}

      <button onClick={loadNearby}>
        {fetching ? "Loading..." : "Refresh"}
      </button>

      <div>Total: {counts.total}</div>
    </div>
  );
};

export default ControlBar;
