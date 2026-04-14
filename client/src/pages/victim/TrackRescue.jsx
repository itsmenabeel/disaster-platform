// TrackRescue.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import TopBar from "../../components/Topbar.jsx";
import TimelineCard from "../../components/TimelineCard";
import StatusVolunteerCards from "../../components/StatusVolunteerCards";
import RequestDetailsCard from "../../components/RequestDetailsCard";
import MediaCard from "../../components/Mediacard.jsx";
import "../../css/TrackRescue.css";

/* ─── Static config maps ─────────────────────────────────────────── */
const PRIORITY_CONFIG = {
  critical: { color: "#e63946", label: "CRITICAL" },
  high: { color: "#e67e22", label: "HIGH" },
  medium: { color: "#f39c12", label: "MEDIUM" },
  low: { color: "#2ecc71", label: "LOW" },
};

const STATUS_CONFIG = {
  pending: {
    color: "#f39c12",
    bg: "rgba(243,156,18,0.1)",
    border: "rgba(243,156,18,0.3)",
    label: "Awaiting Volunteer",
    icon: "⏳",
  },
  assigned: {
    color: "#3498db",
    bg: "rgba(52,152,219,0.1)",
    border: "rgba(52,152,219,0.3)",
    label: "Volunteer Assigned",
    icon: "👤",
  },
  on_the_way: {
    color: "#9b59b6",
    bg: "rgba(155,89,182,0.1)",
    border: "rgba(155,89,182,0.3)",
    label: "Help On The Way",
    icon: "🚨",
  },
  rescued: {
    color: "#2ecc71",
    bg: "rgba(46,204,113,0.1)",
    border: "rgba(46,204,113,0.3)",
    label: "You Are Safe",
    icon: "✅",
  },
  closed: {
    color: "#8892a4",
    bg: "rgba(136,146,164,0.1)",
    border: "rgba(136,146,164,0.3)",
    label: "Request Closed",
    icon: "🔒",
  },
};

/* ─── Helpers ────────────────────────────────────────────────────── */
const fmt = (dateStr) =>
  new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const timeAgo = (dateStr) => {
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/* ─── Component ─────────────────────────────────────────────────── */
const TrackRescue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sos, setSos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSOS = useCallback(async () => {
    try {
      const res = await api.get(`/sos/${id}`);
      setSos(res.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load rescue status.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSOS();
  }, [fetchSOS]);

  // Auto-poll every 10 s — stop once resolved
  useEffect(() => {
    if (!sos) return;
    if (sos.status === "rescued" || sos.status === "closed") return;
    const iv = setInterval(fetchSOS, 10_000);
    return () => clearInterval(iv);
  }, [sos, fetchSOS]);

  /* ── Loading ── */
  if (loading)
    return (
      <div className="tr-page">
        <TopBar user={user} />
        <div className="tr-centre-wrap">
          <span>Loading rescue status...</span>
        </div>
      </div>
    );

  /* ── Error ── */
  if (error)
    return (
      <div className="tr-page">
        <TopBar
          user={user}
          onBack={() => navigate("/victim")}
          subtitle="VICTIM PORTAL — LIVE TRACKING"
        />
        <div className="tr-centre-wrap">
          <div
            className="error-msg"
            style={{ maxWidth: 420, textAlign: "center" }}
          >
            {error}
          </div>
        </div>
      </div>
    );

  /* ── Derived values ── */
  const cfg = STATUS_CONFIG[sos.status] || STATUS_CONFIG.pending;
  const priority = PRIORITY_CONFIG[sos.priority] || PRIORITY_CONFIG.medium;
  const isResolved = sos.status === "rescued" || sos.status === "closed";

  const bannerText = isResolved
    ? `REQUEST #${sos._id.slice(-6).toUpperCase()} — ${cfg.label.toUpperCase()}`
    : `ACTIVE SOS — ${cfg.label.toUpperCase()} — REQ #${sos._id.slice(-6).toUpperCase()}`;

  /* ── Render ── */
  return (
    <div className="tr-page">
      {/* Alert banner */}
      <div
        className="tr-alert-banner"
        style={{ background: isResolved ? "#2a2f3a" : cfg.color }}
      >
        {!isResolved && <div className="tr-alert-dot" />}
        {bannerText}
      </div>

      {/* Top bar */}
      <TopBar
        user={user}
        onBack={() => navigate("/victim")}
        subtitle="VICTIM PORTAL — LIVE TRACKING"
      />

      {/* Main content */}
      <div className="tr-content">
        {/* Page header */}
        <div className="tr-page-header">
          <div
            className="tr-live-tag"
            style={{
              background: `${cfg.color}1a`,
              border: `1px solid ${cfg.color}55`,
              color: cfg.color,
            }}
          >
            <div
              className={`tr-live-tag__dot ${!isResolved ? "tr-live-tag__dot--pulse" : ""}`}
              style={{ background: cfg.color }}
            />
            {isResolved ? "RESOLVED" : "LIVE TRACKING"}
          </div>

          <div className="tr-page-title">Rescue Status</div>

          <div className="tr-page-meta">
            <span>ID: #{sos._id.slice(-8).toUpperCase()}</span>
            <span>
              Submitted: {fmt(sos.createdAt)} ({timeAgo(sos.createdAt)})
            </span>
            <span style={{ color: priority.color }}>
              PRIORITY: {priority.label}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <TimelineCard
          status={sos.status}
          statusColor={cfg.color}
          lastUpdated={lastUpdated}
        />

        {/* Status + Volunteer */}
        <StatusVolunteerCards sos={sos} statusCfg={cfg} />

        {/* Request details */}
        <RequestDetailsCard sos={sos} />

        {/* Media */}
        <MediaCard media={sos.media} />

        {/* Auto-refresh indicator */}
        {!isResolved && (
          <div className="tr-refresh-note">
            <div className="tr-refresh-note__dot" />
            AUTO-REFRESHING EVERY 10 SECONDS — STATUS UPDATES LIVE
          </div>
        )}

        {/* Resolved message */}
        {isResolved && (
          <div className="success-msg tr-resolved-msg">
            {sos.status === "rescued"
              ? "✓ You have been successfully rescued. Stay safe and follow further instructions from the relief team."
              : "✓ This SOS request has been closed by the system administrator."}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackRescue;
