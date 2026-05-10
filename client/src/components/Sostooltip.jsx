// src/components/SosTooltip.jsx
import React from "react";
import "../css/NearbyMap.css";
import { Utensils, Pill, Home, Droplets, Shirt, Package, Clock } from "lucide-react";

const NEED_EMOJIS = {
  food: <Utensils size={12} />,
  medicine: <Pill size={12} />,
  shelter: <Home size={12} />,
  water: <Droplets size={12} />,
  clothing: <Shirt size={12} />,
  other: <Package size={12} />,
};

const timeAgo = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const SosTooltip = ({ req, priorityCfg, lat, lng }) => (
  <div className="nm-sos-tooltip">
    {/* Header: ID + priority badge */}
    <div className="nm-sos-tooltip__header">
      <span className="nm-sos-tooltip__id">
        #{req._id.slice(-6).toUpperCase()}
      </span>
      <span
        className="nm-sos-tooltip__badge"
        style={{
          background: `${priorityCfg.color}22`,
          border: `1px solid ${priorityCfg.color}55`,
          color: priorityCfg.color,
        }}
      >
        {priorityCfg.label}
      </span>
    </div>

    {/* Needs chips */}
    <div className="nm-sos-tooltip__needs">
      {req.needs.map((n) => (
        <span key={n} className="nm-sos-tooltip__need-chip">
          {NEED_EMOJIS[n] || <Package size={12} />} {n}
        </span>
      ))}
    </div>

    {/* Victim name */}
    {req.victim?.name && (
      <div className="nm-sos-tooltip__row">
        <span className="nm-sos-tooltip__key">Victim</span>
        <span>{req.victim.name}</span>
      </div>
    )}

    {/* Address */}
    {req.address && (
      <div className="nm-sos-tooltip__row">
        <span className="nm-sos-tooltip__key">Address</span>
        <span>{req.address}</span>
      </div>
    )}

    {/* Description */}
    {req.description && (
      <div className="nm-sos-tooltip__row">
        <span className="nm-sos-tooltip__key">Note</span>
        <span>
          {req.description.length > 70
            ? req.description.slice(0, 70) + "…"
            : req.description}
        </span>
      </div>
    )}

    {/* GPS */}
    <div className="nm-sos-tooltip__row">
      <span className="nm-sos-tooltip__key">GPS</span>
      <span className="nm-sos-tooltip__gps">
        {lat.toFixed(5)}°N, {lng.toFixed(5)}°E
      </span>
    </div>

    {/* Footer */}
    <div className="nm-sos-tooltip__footer">
      <Clock size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Submitted {timeAgo(req.createdAt)}
    </div>
    <div className="nm-sos-tooltip__hint">Click for full details →</div>
  </div>
);

export default SosTooltip;
