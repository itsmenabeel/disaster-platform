import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import NavTopBar from "../../components/NavTopBar";

/* ─── Static config ──────────────────────────────────────────────── */
const NEEDS = [
  { value: "food",      emoji: "🍱", label: "Food"     },
  { value: "medicine",  emoji: "💊", label: "Medicine"  },
  { value: "shelter",   emoji: "🏠", label: "Shelter"   },
  { value: "water",     emoji: "💧", label: "Water"     },
  { value: "clothing",  emoji: "👕", label: "Clothing"  },
  { value: "other",     emoji: "📦", label: "Other"     },
];

const RESOLVE_PRESETS = [
  "False alarm",
  "Aid already received from another source",
  "Situation is no longer critical",
  "Resolved on my own",
  "Other…",
];

/* ─── Styles ─────────────────────────────────────────────────────── */
const styles = {
  page: { minHeight: "100vh", background: "var(--bg-base)" },

  alertBanner: {
    background: "#1a7a5e",
    padding: "10px 24px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.8rem",
    fontFamily: "IBM Plex Mono, monospace",
    letterSpacing: "0.06em",
    fontWeight: 500,
    color: "#fff",
  },
  alertDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#fff",
    flexShrink: 0,
  },

  content: {
    maxWidth: "680px",
    margin: "0 auto",
    padding: "40px 24px 120px",
    animation: "fadeUp 0.4s ease both",
  },

  pageHeader: { marginBottom: "32px" },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(26,122,94,0.15)",
    border: "1px solid rgba(26,122,94,0.35)",
    borderRadius: "4px",
    padding: "4px 12px",
    fontSize: "0.7rem",
    fontFamily: "IBM Plex Mono, monospace",
    color: "#1a7a5e",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "12px",
  },
  pageTitle: {
    fontSize: "2.2rem",
    fontFamily: "Oswald, sans-serif",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "6px",
  },
  pageDesc: { color: "var(--text-secondary)", fontSize: "0.9rem" },

  section: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "24px",
    marginBottom: "16px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
    paddingBottom: "14px",
    borderBottom: "1px solid var(--border)",
  },
  sectionNum: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "#1a7a5e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontFamily: "Oswald, sans-serif",
    fontWeight: 700,
    flexShrink: 0,
    color: "#fff",
  },
  sectionTitle: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    color: "var(--text-primary)",
  },

  needsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  needBtn: (selected) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    padding: "14px 10px",
    background: selected ? "rgba(26,122,94,0.15)" : "var(--bg-input)",
    border: `1px solid ${selected ? "rgba(26,122,94,0.5)" : "var(--border)"}`,
    borderRadius: "var(--radius)",
    cursor: "pointer",
    transition: "all 0.15s ease",
    userSelect: "none",
  }),
  needEmoji: { fontSize: "1.5rem", lineHeight: 1 },
  needLabel: (selected) => ({
    fontSize: "0.78rem",
    fontWeight: 600,
    color: selected ? "#1a7a5e" : "var(--text-secondary)",
    fontFamily: "Oswald, sans-serif",
    letterSpacing: "0.04em",
  }),

  gpsBox: (status) => ({
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 16px",
    background:
      status === "success"
        ? "rgba(46,204,113,0.08)"
        : status === "error"
          ? "rgba(230,57,70,0.08)"
          : "var(--bg-input)",
    border: `1px solid ${
      status === "success"
        ? "rgba(46,204,113,0.3)"
        : status === "error"
          ? "rgba(230,57,70,0.3)"
          : "var(--border)"
    }`,
    borderRadius: "var(--radius)",
  }),
  gpsIcon: { fontSize: "1.4rem", lineHeight: 1 },
  gpsInfo: { flex: 1 },
  gpsTitle: (status) => ({
    fontSize: "0.875rem",
    fontWeight: 600,
    color:
      status === "success"
        ? "var(--success)"
        : status === "error"
          ? "var(--accent)"
          : "var(--text-primary)",
    marginBottom: "2px",
  }),
  gpsCoords: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
  },
  gpsBtn: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "7px 14px",
    color: "var(--text-secondary)",
    fontSize: "0.8rem",
    fontFamily: "Oswald, sans-serif",
    letterSpacing: "0.04em",
    cursor: "pointer",
    flexShrink: 0,
    transition: "all var(--transition)",
  },

  /* Existing media */
  existingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "10px",
    marginBottom: "14px",
  },
  mediaCard: {
    position: "relative",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
  },
  mediaThumb: {
    width: "100%",
    height: "80px",
    objectFit: "cover",
    display: "block",
  },
  videoThumb: {
    width: "100%",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-elevated)",
    fontSize: "2rem",
  },
  mediaMeta: { padding: "5px 7px" },
  mediaLabel: {
    fontSize: "0.65rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
    letterSpacing: "0.04em",
  },
  removedOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(230,57,70,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "0.75rem",
    fontFamily: "Oswald, sans-serif",
    letterSpacing: "0.06em",
    flexDirection: "column",
    gap: "4px",
  },

  /* New file upload zone */
  uploadZone: {
    border: "2px dashed var(--border)",
    borderRadius: "var(--radius)",
    padding: "22px 20px",
    textAlign: "center",
    cursor: "pointer",
    background: "var(--bg-input)",
    display: "block",
    transition: "border-color var(--transition)",
  },
  uploadIcon: { fontSize: "1.6rem", marginBottom: "6px", lineHeight: 1 },
  uploadText: { fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "3px" },
  uploadHint: {
    fontSize: "0.7rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
    letterSpacing: "0.04em",
  },

  newFileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "10px",
    marginTop: "14px",
  },
  fileCard: {
    position: "relative",
    background: "var(--bg-elevated)",
    border: "1px solid rgba(26,122,94,0.4)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
  },
  fileThumb: { width: "100%", height: "80px", objectFit: "cover", display: "block" },
  fileMeta: { padding: "5px 7px" },
  fileName: {
    fontSize: "0.7rem",
    color: "var(--text-secondary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  fileSize: {
    fontSize: "0.65rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
  },
  removeFileBtn: {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "rgba(230,57,70,0.85)",
    border: "none",
    color: "#fff",
    fontSize: "0.65rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
  },

  /* Bottom action bar */
  actionBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: "var(--bg-surface)",
    borderTop: "1px solid var(--border)",
    padding: "16px 24px",
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    backdropFilter: "blur(8px)",
  },
  saveBtn: {
    flex: 1,
    maxWidth: 280,
    padding: "14px 24px",
    background: "linear-gradient(135deg, #1a7a5e, #0f5c44)",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontFamily: "Oswald, sans-serif",
    fontSize: "1rem",
    letterSpacing: "0.06em",
    cursor: "pointer",
    transition: "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  resolveBtn: {
    flex: 1,
    maxWidth: 280,
    padding: "14px 24px",
    background: "transparent",
    border: "1px solid #e63946",
    borderRadius: "8px",
    color: "#e63946",
    fontFamily: "Oswald, sans-serif",
    fontSize: "1rem",
    letterSpacing: "0.06em",
    cursor: "pointer",
    transition: "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  /* ── Resolve modal ── */
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    animation: "fadeIn 0.15s ease",
  },
  modalBox: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "32px 28px",
    maxWidth: "480px",
    width: "100%",
    animation: "fadeUp 0.2s ease both",
  },
  modalTitle: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "6px",
  },
  modalDesc: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    lineHeight: 1.6,
    marginBottom: "22px",
  },
  reasonsLabel: {
    fontSize: "0.68rem",
    fontFamily: "IBM Plex Mono, monospace",
    color: "var(--text-muted)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  reasonBtn: (selected) => ({
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "11px 14px",
    marginBottom: "8px",
    background: selected ? "rgba(230,57,70,0.12)" : "var(--bg-input)",
    border: `1px solid ${selected ? "rgba(230,57,70,0.5)" : "var(--border)"}`,
    borderRadius: "var(--radius)",
    color: selected ? "#e63946" : "var(--text-secondary)",
    fontSize: "0.88rem",
    fontFamily: "IBM Plex Mono, monospace",
    cursor: "pointer",
    transition: "all 0.15s ease",
    letterSpacing: "0.02em",
  }),
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "22px",
  },
  confirmBtn: (disabled) => ({
    flex: 1,
    padding: "13px",
    background: disabled
      ? "var(--bg-elevated)"
      : "linear-gradient(135deg, #c1121f, #e63946)",
    border: "none",
    borderRadius: "var(--radius)",
    color: disabled ? "var(--text-muted)" : "#fff",
    fontFamily: "Oswald, sans-serif",
    fontSize: "0.95rem",
    letterSpacing: "0.06em",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.15s ease",
  }),
  cancelBtn: {
    flex: 1,
    padding: "13px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-secondary)",
    fontFamily: "Oswald, sans-serif",
    fontSize: "0.95rem",
    letterSpacing: "0.06em",
    cursor: "pointer",
  },
};


const EditSOS = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError]     = useState("");

  const [needs, setNeeds]             = useState([]);
  const [description, setDescription] = useState("");
  const [address, setAddress]         = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [gpsStatus, setGpsStatus]     = useState("idle");

  // Each entry: { dataUri, originalIndex }
  const [existingMedia, setExistingMedia]   = useState([]);
  const [removedIndices, setRemovedIndices] = useState(new Set());
  const [newFiles, setNewFiles]             = useState([]);
  const [newPreviews, setNewPreviews]       = useState([]);

  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showModal, setShowModal]       = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [resolving, setResolving]       = useState(false);
  const [resolveError, setResolveError] = useState("");

  const fetchSOS = useCallback(async () => {
    try {
      const res = await api.get(`/sos/${id}`);
      const sos = res.data.data;

      // Ownership guard
      const victimId =
        typeof sos.victim === "object" ? sos.victim._id : sos.victim;
      if (victimId !== user._id) {
        setLoadError("You are not authorized to edit this SOS request.");
        return;
      }

      // Terminal status guard
      if (sos.status === "rescued" || sos.status === "closed") {
        setLoadError(
          "This SOS request is already resolved and can no longer be edited.",
        );
        return;
      }

      setNeeds(sos.needs || []);
      setDescription(sos.description || "");
      setAddress(sos.address || "");
      if (sos.location?.coordinates) {
        setCoordinates(sos.location.coordinates);
        setGpsStatus("success");
      }

      setExistingMedia(
        (sos.media || []).map((uri, idx) => ({ dataUri: uri, originalIndex: idx })),
      );
    } catch (err) {
      setLoadError(err.response?.data?.message || "Failed to load SOS request.");
    } finally {
      setLoadingData(false);
    }
  }, [id, user._id]);

  useEffect(() => {
    fetchSOS();
  }, [fetchSOS]);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates([pos.coords.longitude, pos.coords.latitude]);
        setGpsStatus("success");
      },
      () => setGpsStatus("error"),
      { timeout: 10000 },
    );
  };

  const gpsStatusText = {
    idle:    { title: "Detecting location…",     coords: "Waiting for GPS signal" },
    loading: { title: "Acquiring GPS signal…",   coords: "Please wait" },
    success: {
      title: "Location acquired",
      coords: coordinates
        ? `${coordinates[1].toFixed(5)}°N, ${coordinates[0].toFixed(5)}°E`
        : "",
    },
    error: { title: "Location unavailable", coords: "GPS access denied or unavailable" },
  };

  const toggleNeed = (value) =>
    setNeeds((prev) =>
      prev.includes(value) ? prev.filter((n) => n !== value) : [...prev, value],
    );


  const toggleRemoveExisting = (originalIndex) => {
    setRemovedIndices((prev) => {
      const next = new Set(prev);
      next.has(originalIndex) ? next.delete(originalIndex) : next.add(originalIndex);
      return next;
    });
  };

  const totalMediaCount =
    existingMedia.length - removedIndices.size + newFiles.length;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (totalMediaCount + selected.length > 5) {
      setSaveError("You can have a maximum of 5 media files in total.");
      e.target.value = "";
      return;
    }
    setSaveError("");
    const merged = [...newFiles, ...selected];
    setNewFiles(merged);
    setNewPreviews(
      merged.map((f) => ({
        url: URL.createObjectURL(f),
        type: f.type,
        name: f.name,
        size: f.size,
      })),
    );
    e.target.value = "";
  };

  const removeNewFile = (index) => {
    URL.revokeObjectURL(newPreviews[index].url);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Save handler ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess(false);

    if (needs.length === 0) {
      setSaveError("Please select at least one need.");
      return;
    }
    if (!coordinates) {
      setSaveError("Location is required. Please allow GPS access.");
      return;
    }

    setSaving(true);
    try {
      // Step 1 — update the SOS fields + remove marked media
      await api.put(`/sos/${id}`, {
        needs,
        description,
        address,
        coordinates,
        removeMediaIndices: [...removedIndices],
      });

      // Step 2 — upload any new media files
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((f) => formData.append("media", f));
        await api.put(`/sos/${id}/media`, formData);
      }

      setSaveSuccess(true);
      setTimeout(() => navigate(`/victim/track/${id}`), 1200);
    } catch (err) {
      setSaveError(
        err.response?.data?.message || "Failed to save changes. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openModal = () => {
    setSelectedReason("");
    setCustomReason("");
    setResolveError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (resolving) return; // Don't close while request is in-flight
    setShowModal(false);
  };

  const isOtherSelected = selectedReason === "Other…";

  const finalReason = isOtherSelected
    ? customReason.trim()
    : selectedReason;

  const canConfirmResolve =
    selectedReason !== "" && (!isOtherSelected || customReason.trim() !== "");

  const handleResolve = async () => {
    if (!canConfirmResolve) return;
    setResolveError("");
    setResolving(true);
    try {
      await api.delete(`/sos/${id}`, { data: { resolveReason: finalReason } });
      setShowModal(false);
      navigate("/victim");
    } catch (err) {
      setResolveError(
        err.response?.data?.message || "Failed to resolve request. Please try again.",
      );
    } finally {
      setResolving(false);
    }
  };


  if (loadingData) {
    return (
      <div style={styles.page}>
        <NavTopBar user={user} onBack={() => navigate("/victim")} subtitle="VICTIM PORTAL — EDIT SOS" />
        <div className="tr-centre-wrap">
          <span>Loading request…</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={styles.page}>
        <NavTopBar user={user} onBack={() => navigate("/victim")} subtitle="VICTIM PORTAL — EDIT SOS" />
        <div className="tr-centre-wrap">
          <div
            className="error-msg"
            style={{ maxWidth: 420, textAlign: "center", padding: "20px" }}
          >
            {loadError}
          </div>
          <button
            className="tr-back-btn"
            style={{ marginTop: "16px" }}
            onClick={() => navigate("/victim")}
          >
            ← BACK TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ── Alert Banner ── */}
      <div style={styles.alertBanner}>
        <div style={styles.alertDot} />
        EDITING SOS REQUEST — CHANGES WILL BE VISIBLE TO YOUR ASSIGNED VOLUNTEER IMMEDIATELY
      </div>

      {/* ── Top Bar ── */}
      <NavTopBar
        user={user}
        onBack={() => navigate(`/victim/track/${id}`)}
        subtitle="VICTIM PORTAL — EDIT SOS REQUEST"
      />

      {/* ── Main Content ── */}
      <div style={styles.content}>
        <div style={styles.pageHeader}>
          <div style={styles.tag}>✏️ EDIT MODE</div>
          <div style={styles.pageTitle}>Edit Your SOS Request</div>
          <div style={styles.pageDesc}>
            Update any details below, then press Save. Your assigned volunteer
            will be notified of the changes.
          </div>
        </div>

        <form onSubmit={handleSave}>
          {/* ── Section 1 — Needs ── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNum}>1</div>
              <div style={styles.sectionTitle}>
                What do you need? (select all that apply)
              </div>
            </div>
            <div style={styles.needsGrid}>
              {NEEDS.map((n) => (
                <div
                  key={n.value}
                  style={styles.needBtn(needs.includes(n.value))}
                  onClick={() => toggleNeed(n.value)}
                >
                  <div style={styles.needEmoji}>{n.emoji}</div>
                  <div style={styles.needLabel(needs.includes(n.value))}>
                    {n.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 2 — Location ── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNum}>2</div>
              <div style={styles.sectionTitle}>Your Location</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={styles.gpsBox(gpsStatus)}>
                <div style={styles.gpsIcon}>📍</div>
                <div style={styles.gpsInfo}>
                  <div style={styles.gpsTitle(gpsStatus)}>
                    {gpsStatusText[gpsStatus].title}
                  </div>
                  <div style={styles.gpsCoords}>
                    {gpsStatusText[gpsStatus].coords}
                  </div>
                </div>
                {gpsStatus !== "loading" && (
                  <button
                    type="button"
                    style={styles.gpsBtn}
                    onClick={fetchLocation}
                  >
                    {gpsStatus === "success" ? "REFRESH" : "RETRY"}
                  </button>
                )}
              </div>

              <div className="field">
                <label>Address / Landmark (optional but helpful)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Bashundhara City, Dhaka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Section 3 — Description ── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNum}>3</div>
              <div style={styles.sectionTitle}>Describe Your Situation</div>
            </div>
            <div className="field">
              <label>Additional Details</label>
              <textarea
                rows={4}
                placeholder="Describe your situation, number of people, any injuries, accessibility issues, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          {/* ── Section 4 — Media ── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNum}>4</div>
              <div style={styles.sectionTitle}>
                Media&nbsp;
                <span
                  style={{
                    color: "var(--text-muted)",
                    fontWeight: 400,
                    fontSize: "0.85rem",
                  }}
                >
                  ({totalMediaCount}/5)
                </span>
              </div>
            </div>

            {/* ── Existing media ── */}
            {existingMedia.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontFamily: "IBM Plex Mono, monospace",
                    color: "var(--text-muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Previously attached — click to toggle removal
                </div>
                <div style={styles.existingGrid}>
                  {existingMedia.map(({ dataUri, originalIndex }) => {
                    const isRemoved = removedIndices.has(originalIndex);
                    const isImage = dataUri.startsWith("data:image");
                    return (
                      <div
                        key={originalIndex}
                        style={{ ...styles.mediaCard, cursor: "pointer" }}
                        onClick={() => toggleRemoveExisting(originalIndex)}
                        title={isRemoved ? "Click to keep" : "Click to remove"}
                      >
                        {isImage ? (
                          <img
                            src={dataUri}
                            alt={`media-${originalIndex}`}
                            style={{
                              ...styles.mediaThumb,
                              opacity: isRemoved ? 0.3 : 1,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              ...styles.videoThumb,
                              opacity: isRemoved ? 0.3 : 1,
                            }}
                          >
                            🎥
                          </div>
                        )}
                        <div style={styles.mediaMeta}>
                          <div style={styles.mediaLabel}>
                            #{originalIndex + 1} {isImage ? "IMAGE" : "VIDEO"}
                          </div>
                        </div>
                        {isRemoved && (
                          <div style={styles.removedOverlay}>
                            <span style={{ fontSize: "1.2rem" }}>✕</span>
                            <span>REMOVED</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── New file upload ── */}
            {totalMediaCount < 5 && (
              <label htmlFor="media-upload-edit" style={styles.uploadZone}>
                <div style={styles.uploadIcon}>📎</div>
                <div style={styles.uploadText}>Click to add more images or videos</div>
                <div style={styles.uploadHint}>
                  JPG · PNG · GIF · MP4 · MOV &nbsp;·&nbsp; Max 2 MB each
                </div>
                <input
                  id="media-upload-edit"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4,video/quicktime,video/x-msvideo"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
            )}

            {newPreviews.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontFamily: "IBM Plex Mono, monospace",
                    color: "#1a7a5e",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: "14px",
                    marginBottom: "8px",
                  }}
                >
                  New files to upload
                </div>
                <div style={styles.newFileGrid}>
                  {newPreviews.map((file, i) => (
                    <div key={i} style={styles.fileCard}>
                      {file.type.startsWith("image/") ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          style={styles.fileThumb}
                        />
                      ) : (
                        <div style={{ ...styles.videoThumb, height: "80px" }}>
                          🎥
                        </div>
                      )}
                      <div style={styles.fileMeta}>
                        <div style={styles.fileName}>{file.name}</div>
                        <div style={styles.fileSize}>
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </div>
                      </div>
                      <button
                        type="button"
                        style={styles.removeFileBtn}
                        onClick={() => removeNewFile(i)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Inline error / success ── */}
          {saveError && (
            <div
              className="error-msg"
              style={{ marginBottom: "12px" }}
            >
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div
              className="success-msg"
              style={{ marginBottom: "12px", textAlign: "center" }}
            >
              ✓ Changes saved! Redirecting…
            </div>
          )}

          {/* Spacer for fixed bar */}
          <div style={{ height: "20px" }} />
        </form>
      </div>

      {/* ── Fixed bottom action bar ── */}
      <div style={styles.actionBar}>
        {/* Resolve button */}
        <button
          type="button"
          style={styles.resolveBtn}
          onClick={openModal}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(230,57,70,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          ✓ RESOLVE SOS
        </button>

        {/* Save button */}
        <button
          type="submit"
          form="edit-sos-form"
          style={{
            ...styles.saveBtn,
            opacity: saving ? 0.7 : 1,
            cursor: saving ? "not-allowed" : "pointer",
          }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "⟳ SAVING…" : "💾 SAVE CHANGES"}
        </button>
      </div>

      {/* ── Resolve Modal ── */}
      {showModal && (
        <div
          style={styles.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div style={styles.modalBox}>
            {/* Modal header */}
            <div style={styles.modalTitle}>⚠ Resolve &amp; Close SOS</div>
            <div style={styles.modalDesc}>
              Resolving this request will permanently close it. If a volunteer
              was assigned, they will be notified immediately. Please choose a
              reason so we can improve our response system.
            </div>

            {/* Reason selector */}
            <div style={styles.reasonsLabel}>Why are you resolving?</div>
            {RESOLVE_PRESETS.map((reason) => (
              <button
                key={reason}
                type="button"
                style={styles.reasonBtn(selectedReason === reason)}
                onClick={() => setSelectedReason(reason)}
              >
                {selectedReason === reason ? "◉" : "○"}&nbsp;&nbsp;{reason}
              </button>
            ))}

            {/* Custom reason textarea — shown when "Other…" is selected */}
            {isOtherSelected && (
              <div className="field" style={{ marginTop: "4px" }}>
                <label
                  style={{
                    fontSize: "0.72rem",
                    fontFamily: "IBM Plex Mono, monospace",
                    color: "var(--text-muted)",
                    letterSpacing: "0.06em",
                  }}
                >
                  Please describe your reason
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter your reason here…"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  style={{ resize: "vertical" }}
                  autoFocus
                />
              </div>
            )}

            {/* Inline resolve error */}
            {resolveError && (
              <div
                className="error-msg"
                style={{ marginTop: "12px", fontSize: "0.82rem" }}
              >
                {resolveError}
              </div>
            )}

            {/* Modal action buttons */}
            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={closeModal}
                disabled={resolving}
              >
                CANCEL
              </button>
              <button
                type="button"
                style={styles.confirmBtn(!canConfirmResolve || resolving)}
                onClick={handleResolve}
                disabled={!canConfirmResolve || resolving}
              >
                {resolving ? "⟳ RESOLVING…" : "✓ CONFIRM RESOLVE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditSOS;
