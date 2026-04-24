// components/TrackRescue/RequestDetailsCard.jsx
import React from "react";
import "../css/TrackRescue.css";

const NEED_EMOJIS = {
  food: "🍱",
  medicine: "💊",
  shelter: "🏠",
  water: "💧",
  clothing: "👕",
  other: "📦",
};

const fmt = (dateStr) =>
  new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const RequestDetailsCard = ({ sos }) => (
  <div className="tr-card">
    <div className="tr-card__header">
      <div className="tr-card__title">Your Request Details</div>
    </div>

    {/* Needs */}
    <div className="tr-vol-card__micro-label">What you need</div>
    <div className="tr-needs-row">
      {sos.needs.map((n) => (
        <div key={n} className="tr-need-chip">
          <span>{NEED_EMOJIS[n] || "📦"}</span>
          <span>{n}</span>
        </div>
      ))}
    </div>

    {/* Description */}
    {sos.description && (
      <div className="tr-detail-row">
        <div className="tr-detail-row__key">Description</div>
        <div>{sos.description}</div>
      </div>
    )}

    {/* Address */}
    {sos.address && (
      <div className="tr-detail-row">
        <div className="tr-detail-row__key">Address</div>
        <div>{sos.address}</div>
      </div>
    )}

    {/* GPS */}
    {sos.location?.coordinates && (
      <div className="tr-detail-row">
        <div className="tr-detail-row__key">GPS</div>
        <div className="tr-detail-row__gps">
          {sos.location.coordinates[1].toFixed(5)}°N,&nbsp;
          {sos.location.coordinates[0].toFixed(5)}°E
        </div>
      </div>
    )}

    {/* Resolved at */}
    {sos.resolvedAt && (
      <div className="tr-detail-row">
        <div className="tr-detail-row__key">Resolved</div>
        <div>{fmt(sos.resolvedAt)}</div>
      </div>
    )}
  </div>
);

export default RequestDetailsCard;
