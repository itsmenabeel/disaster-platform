import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import NavTopBar from "../../components/NavTopBar";
import HeaderTag from "../../components/HeaderTag";
import MediaCard from "../../components/Mediacard";

/* ── Static config (same as NearbyMap) ── */
const NEED_EMOJIS = {
  food: "🍱",
  medicine: "💊",
  shelter: "🏠",
  water: "💧",
  clothing: "👕",
  other: "📦",
};

const PRIORITY = {
  critical: { color: "#e63946", label: "CRITICAL" },
  high: { color: "#e67e22", label: "HIGH" },
  medium: { color: "#f39c12", label: "MEDIUM" },
  low: { color: "#2ecc71", label: "LOW" },
};

const STATUS_CONFIG = {
  pending: { color: "#f39c12", label: "PENDING" },
  assigned: { color: "#3498db", label: "ASSIGNED" },
  on_the_way: { color: "#9b59b6", label: "ON THE WAY" },
  rescued: { color: "#2ecc71", label: "RESCUED" },
  closed: { color: "#4a5260", label: "CLOSED" },
};

const timeAgo = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/* ── Section heading helper ── */
const SectionLabel = ({ children }) => (
  <div
    style={{
      fontSize: "0.62rem",
      fontFamily: "IBM Plex Mono, monospace",
      color: "#4a5260",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      marginBottom: 8,
    }}
  >
    {children}
  </div>
);

/* ── Info row helper ── */
const InfoRow = ({ label, value, mono = false }) => (
  <div
    style={{
      display: "flex",
      gap: 12,
      fontSize: "0.82rem",
      color: "#8892a4",
      marginBottom: 8,
      lineHeight: 1.5,
    }}
  >
    <span
      style={{
        fontSize: "0.62rem",
        fontFamily: "IBM Plex Mono, monospace",
        color: "#4a5260",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        flexShrink: 0,
        paddingTop: 2,
        minWidth: 72,
      }}
    >
      {label}
    </span>
    <span
      style={
        mono
          ? { fontFamily: "IBM Plex Mono, monospace", fontSize: "0.78rem" }
          : {}
      }
    >
      {value}
    </span>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   SOSDetailPage
══════════════════════════════════════════════════════════════ */
const SOSDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sos, setSos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState("");

  const [actionLoading, setActionLoading] = useState(false); // accept/reject in-flight
  const [actionErr, setActionErr] = useState("");
  const [accepted, setAccepted] = useState(false);

  /* ── Fetch SOS detail on mount ── */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/sos/${id}`);
        setSos(res.data.data);
      } catch (err) {
        setFetchErr(
          err.response?.data?.message || "Failed to load SOS request.",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  /* ── Accept handler ── */
  const handleAccept = async () => {
    setActionLoading(true);
    setActionErr("");
    try {
      await api.put(`/sos/${id}/accept`);
      setAccepted(true);
      setTimeout(() => navigate("/volunteer/tasks"), 1800);
    } catch (err) {
      setActionErr(err.response?.data?.message || "Failed to accept request.");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Reject handler ── */
  const handleReject = async () => {
    setActionLoading(true);
    setActionErr("");
    try {
      await api.put(`/sos/${id}/reject`);
      navigate("/volunteer/map");
    } catch (err) {
      // Even on error, navigate back — rejection is a UX action
      navigate("/volunteer/map");
    }
  };

  /* ──────────── Derived helpers ──────────── */
  const p = sos ? PRIORITY[sos.priority] || PRIORITY.medium : null;
  const sc = sos ? STATUS_CONFIG[sos.status] || STATUS_CONFIG.pending : null;
  const [lng, lat] = sos?.location?.coordinates || [0, 0];
  const isPending = sos?.status === "pending";

  /* ──────────────────── RENDER ──────────────────── */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0c0f",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      {/* ══════ TOP BAR ══════ */}
      <NavTopBar
        user={user}
        onBack={() => navigate("/volunteer")}
        subtitle="VOLUNTEER PORTAL — RESCUE TASK VIEW"
      />
      {/* ══════ LOADING STATE ══════ */}
      {loading && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            color: "#4a5260",
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: "0.88rem",
          }}
        >
          <div style={{ fontSize: "2rem" }}>📡</div>
          Loading SOS request…
        </div>
      )}

      {/* ══════ FETCH ERROR STATE ══════ */}
      {!loading && fetchErr && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 32,
          }}
        >
          <div style={{ fontSize: "2rem" }}>❌</div>
          <div
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.88rem",
              color: "#e63946",
              textAlign: "center",
            }}
          >
            {fetchErr}
          </div>
          <button
            onClick={() => navigate("/volunteer/map")}
            style={{
              padding: "10px 24px",
              background: "#3498db",
              border: "none",
              borderRadius: 6,
              color: "#fff",
              fontFamily: "Oswald, sans-serif",
              fontSize: "0.9rem",
              letterSpacing: "0.04em",
              cursor: "pointer",
            }}
          >
            ← BACK TO MAP
          </button>
        </div>
      )}

      {/* ══════ SUCCESS (ACCEPTED) STATE ══════ */}
      {accepted && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(10,12,15,0.95)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: "3rem" }}>✅</div>
          <div
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "1.4rem",
              color: "#2ecc71",
              letterSpacing: "0.06em",
            }}
          >
            ACCEPTED!
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.82rem",
              color: "#4a5260",
            }}
          >
            Redirecting to your tasks…
          </div>
        </div>
      )}

      {/* ══════ MAIN CONTENT ══════ */}
      {!loading && !fetchErr && sos && (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px",
            paddingBottom: 120, // space for fixed bottom bar
            maxWidth: 720,
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <HeaderTag
            subtitle={`⬤ VOLUNTEER — SOS REQUEST DETAIL ${
              sos ? `#${sos._id.slice(-8).toUpperCase()}` : "LOADING…"
            }`}
          />
          {/* ── Priority + Status badges ── */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 28,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "5px 14px",
                borderRadius: 6,
                background: `${p.color}18`,
                border: `1px solid ${p.color}55`,
                fontSize: "0.75rem",
                fontFamily: "IBM Plex Mono, monospace",
                color: p.color,
                letterSpacing: "0.08em",
              }}
            >
              ⚠ {p.label} PRIORITY
            </span>
            <span
              style={{
                padding: "5px 14px",
                borderRadius: 6,
                background: `${sc.color}18`,
                border: `1px solid ${sc.color}55`,
                fontSize: "0.75rem",
                fontFamily: "IBM Plex Mono, monospace",
                color: sc.color,
                letterSpacing: "0.08em",
              }}
            >
              ◈ {sc.label}
            </span>
          </div>

          {/* ── Victim Info card ── */}
          <div
            style={{
              background: "#111318",
              border: "1px solid #2a2f3a",
              borderRadius: 10,
              padding: "20px 22px",
              marginBottom: 16,
            }}
          >
            <SectionLabel>Victim Information</SectionLabel>
            {sos.victim?.name && (
              <InfoRow label="Name" value={sos.victim.name} />
            )}
            {sos.victim?.phone && (
              <InfoRow label="Phone" value={sos.victim.phone} mono />
            )}
          </div>

          {/* ── Needs card ── */}
          <div
            style={{
              background: "#111318",
              border: "1px solid #2a2f3a",
              borderRadius: 10,
              padding: "20px 22px",
              marginBottom: 16,
            }}
          >
            <SectionLabel>Needs</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {sos.needs.map((n) => (
                <span
                  key={n}
                  style={{
                    fontSize: "0.85rem",
                    padding: "5px 14px",
                    background: "#181c23",
                    border: "1px solid #2a2f3a",
                    borderRadius: 20,
                    color: "#eef0f4",
                  }}
                >
                  {NEED_EMOJIS[n] || "📦"} {n}
                </span>
              ))}
            </div>
          </div>

          {/* ── Description card ── */}
          {sos.description && (
            <div
              style={{
                background: "#111318",
                border: "1px solid #2a2f3a",
                borderRadius: 10,
                padding: "20px 22px",
                marginBottom: 16,
              }}
            >
              <SectionLabel>Description</SectionLabel>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.88rem",
                  color: "#8892a4",
                  lineHeight: 1.65,
                }}
              >
                {sos.description}
              </p>
            </div>
          )}

          {/* ── Location card ── */}
          <div
            style={{
              background: "#111318",
              border: "1px solid #2a2f3a",
              borderRadius: 10,
              padding: "20px 22px",
              marginBottom: 16,
            }}
          >
            <SectionLabel>Location</SectionLabel>
            {sos.address && <InfoRow label="Address" value={sos.address} />}
            <InfoRow
              label="GPS"
              value={`${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E`}
              mono
            />
            <a
              href={`https://maps.google.com/?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
                fontSize: "0.75rem",
                fontFamily: "IBM Plex Mono, monospace",
                color: "#3498db",
                textDecoration: "none",
                letterSpacing: "0.04em",
              }}
            >
              🗺 Open in Google Maps →
            </a>
          </div>

          {/* ── Timestamps card ── */}
          <div
            style={{
              background: "#111318",
              border: "1px solid #2a2f3a",
              borderRadius: 10,
              padding: "20px 22px",
              marginBottom: 16,
            }}
          >
            <SectionLabel>Timeline</SectionLabel>
            <InfoRow
              label="Submitted"
              value={`${timeAgo(sos.createdAt)}  (${new Date(sos.createdAt).toLocaleString()})`}
              mono
            />
            {sos.resolvedAt && (
              <InfoRow
                label="Resolved"
                value={new Date(sos.resolvedAt).toLocaleString()}
                mono
              />
            )}
          </div>

          {/* ── Assigned volunteer card (if already assigned) ── */}
          {sos.assignedVolunteer && (
            <div
              style={{
                background: "#111318",
                border: `1px solid #3498db44`,
                borderRadius: 10,
                padding: "20px 22px",
                marginBottom: 16,
              }}
            >
              <SectionLabel>Assigned Volunteer</SectionLabel>
              {sos.assignedVolunteer.name && (
                <InfoRow label="Name" value={sos.assignedVolunteer.name} />
              )}
              {sos.assignedVolunteer.phone && (
                <InfoRow
                  label="Phone"
                  value={sos.assignedVolunteer.phone}
                  mono
                />
              )}
            </div>
          )}

          {/* ── Media card ── */}
          <MediaCard media={sos.media} />

          {/* ── Action error inline ── */}
          {actionErr && (
            <div
              style={{
                background: "#e6394615",
                border: "1px solid #e6394640",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 16,
                fontSize: "0.82rem",
                fontFamily: "IBM Plex Mono, monospace",
                color: "#e63946",
              }}
            >
              ⚠ {actionErr}
            </div>
          )}
        </div>
      )}

      {/* ══════ FIXED BOTTOM ACTION BAR ══════ */}
      {!loading && !fetchErr && sos && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: "#111318",
            borderTop: "1px solid #2a2f3a",
            padding: "16px 28px",
            display: "flex",
            gap: 14,
            justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* REJECT button */}
          <button
            onClick={handleReject}
            disabled={actionLoading || accepted}
            style={{
              flex: 1,
              maxWidth: 280,
              padding: "14px 24px",
              background: "transparent",
              border: "1px solid #e63946",
              borderRadius: 8,
              color: actionLoading || accepted ? "#4a5260" : "#e63946",
              fontFamily: "Oswald, sans-serif",
              fontSize: "1rem",
              letterSpacing: "0.06em",
              cursor: actionLoading || accepted ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              if (!actionLoading && !accepted) {
                e.currentTarget.style.background = "rgba(230,57,70,0.12)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            ✕ REJECT
          </button>

          {/* ACCEPT button */}
          <button
            onClick={handleAccept}
            disabled={actionLoading || accepted || !isPending}
            title={
              !isPending
                ? `Cannot accept — status is "${sos?.status}"`
                : "Accept this SOS request"
            }
            style={{
              flex: 1,
              maxWidth: 280,
              padding: "14px 24px",
              background:
                actionLoading || accepted || !isPending
                  ? "#1a2a1a"
                  : "linear-gradient(135deg, #27ae60, #2ecc71)",
              border: `1px solid ${!isPending ? "#2a2f3a" : "#2ecc71"}`,
              borderRadius: 8,
              color:
                actionLoading || accepted || !isPending ? "#4a5260" : "#fff",
              fontFamily: "Oswald, sans-serif",
              fontSize: "1rem",
              letterSpacing: "0.06em",
              cursor:
                actionLoading || accepted || !isPending
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {actionLoading
              ? "⟳ PROCESSING…"
              : accepted
                ? "✓ ACCEPTED"
                : "✓ ACCEPT MISSION"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SOSDetailPage;
