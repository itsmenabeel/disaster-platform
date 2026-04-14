import React from "react";
import "../css/NearbyMap.css";

const RADIUS_OPTIONS = [
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "20 km", value: 20000 },
  { label: "50 km", value: 50000 },
];

const timeAgo = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const ControlBar = ({
  radius,
  setRadius,
  myCoords,
  fetching,
  fetchErr,
  updatedAt,
  loadNearby,
  counts,
}) => (
  <div className="nm-controls">
    {/* ── Radius label ── */}
    <span className="nm-controls__radius-label">Radius:</span>

    {/* ── Radius buttons ── */}
    <div className="nm-controls__radius-btns">
      {RADIUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setRadius(opt.value)}
          className={`nm-radius-btn${radius === opt.value ? " nm-radius-btn--active" : ""}`}
        >
          {opt.label}
        </button>
      ))}
    </div>

    {/* ── Refresh button ── */}
    <button
      onClick={loadNearby}
      disabled={!myCoords || fetching}
      className={`nm-controls__refresh-btn${
        myCoords && !fetching
          ? " nm-controls__refresh-btn--active"
          : " nm-controls__refresh-btn--disabled"
      }`}
    >
      {fetching ? "⟳ Loading..." : "⟳ REFRESH"}
    </button>

    {/* ── Last updated ── */}
    {updatedAt && (
      <span className="nm-controls__updated">Updated {timeAgo(updatedAt)}</span>
    )}

    {/* ── Fetch error ── */}
    {fetchErr && <span className="nm-controls__error">{fetchErr}</span>}

    {/* ── Stats chips ── */}
    <div className="nm-controls__chips">
      {[
        { color: "#3498db", label: `${counts.total} TOTAL`, show: true },
        {
          color: "#e63946",
          label: `${counts.critical} CRITICAL`,
          show: counts.critical > 0,
        },
        {
          color: "#e67e22",
          label: `${counts.high} HIGH`,
          show: counts.high > 0,
        },
        {
          color: "#f39c12",
          label: `${counts.medium} MEDIUM`,
          show: counts.medium > 0,
        },
        { color: "#2ecc71", label: `${counts.low} LOW`, show: counts.low > 0 },
      ]
        .filter((c) => c.show)
        .map((c) => (
          <div
            key={c.label}
            className="nm-chip"
            style={{
              background: `${c.color}15`,
              border: `1px solid ${c.color}40`,
              color: c.color,
            }}
          >
            <div
              className={`nm-chip__dot${
                c.color === "#e63946" && counts.critical > 0
                  ? " nm-chip__dot--pulse"
                  : ""
              }`}
              style={{ background: c.color }}
            />
            {c.label}
          </div>
        ))}
    </div>
  </div>
);

export default ControlBar;
