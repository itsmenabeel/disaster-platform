import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import NavTopBar from "../../components/NavTopBar";
const initialForm = {
  name: "",
  address: "",
  latitude: "",
  longitude: "",
  capacity: 50,
  currentOccupancy: 0,
  isActive: "true",
};

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right, rgba(52, 152, 219, 0.12), transparent 30%), var(--bg-base)",
  },
  shell: {
    maxWidth: "1240px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  headerBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  eyebrow: {
    display: "inline-flex",
    width: "fit-content",
    padding: "4px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(52, 152, 219, 0.3)",
    background: "rgba(52, 152, 219, 0.1)",
    color: "var(--info)",
    fontSize: "0.75rem",
    fontFamily: "IBM Plex Mono, monospace",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    fontSize: "2.7rem",
  },
  subtitle: {
    color: "var(--text-secondary)",
    maxWidth: "760px",
    fontSize: "0.95rem",
  },
  nav: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  navLink: (active) => ({
    padding: "10px 14px",
    borderRadius: "var(--radius)",
    border: `1px solid ${active ? "rgba(52, 152, 219, 0.35)" : "var(--border)"}`,
    background: active ? "rgba(52, 152, 219, 0.12)" : "var(--bg-surface)",
    color: active ? "var(--info)" : "var(--text-secondary)",
    fontSize: "0.85rem",
    fontWeight: 600,
  }),

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },
  statCard: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "18px",
    boxShadow: "var(--shadow)",
  },
  statLabel: {
    color: "var(--text-muted)",
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "1.9rem",
    fontFamily: "Oswald, sans-serif",
  },
  statHint: {
    color: "var(--text-secondary)",
    fontSize: "0.82rem",
    marginTop: "6px",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(320px, 390px) minmax(0, 1fr)",
    gap: "24px",
    alignItems: "start",
  },
  panel: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "22px",
    boxShadow: "var(--shadow)",
  },
  panelTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    marginBottom: "18px",
  },
  panelTitle: {
    fontSize: "1.55rem",
  },
  panelText: {
    color: "var(--text-secondary)",
    fontSize: "0.88rem",
    marginBottom: "18px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  fieldHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "6px",
  },
  fieldLabel: {
    fontSize: "0.78rem",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--text-secondary)",
  },
  split: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },
  locationBtn: {
    background: "rgba(52, 152, 219, 0.1)",
    color: "var(--info)",
    border: "1px solid rgba(52, 152, 219, 0.28)",
    borderRadius: "var(--radius)",
    padding: "8px 12px",
    fontSize: "0.72rem",
    fontFamily: "IBM Plex Mono, monospace",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  locationHint: {
    color: "var(--text-muted)",
    fontSize: "0.78rem",
    marginTop: "-6px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "4px",
  },
  secondaryBtn: {
    flex: 1,
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
    borderRadius: "var(--radius)",
    padding: "12px 16px",
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  cardList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  campCard: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "18px",
  },
  campTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  campTitle: {
    fontSize: "1.2rem",
  },
  campMeta: {
    color: "var(--text-secondary)",
    fontSize: "0.87rem",
  },
  badge: (active) => ({
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    background: active ? "rgba(46, 204, 113, 0.14)" : "rgba(255,255,255,0.06)",
    color: active ? "var(--success)" : "var(--text-secondary)",
    border: active
      ? "1px solid rgba(46, 204, 113, 0.3)"
      : "1px solid var(--border)",
  }),
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "14px",
  },
  cellLabel: {
    color: "var(--text-muted)",
    fontSize: "0.74rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "4px",
  },
  cellValue: {
    fontSize: "0.92rem",
    color: "var(--text-primary)",
  },
  progressTrack: {
    height: "10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressFill: (ratio) => ({
    width: `${Math.max(6, Math.min(100, ratio * 100))}%`,
    height: "100%",
    borderRadius: "999px",
    background:
      ratio >= 1
        ? "var(--accent)"
        : ratio >= 0.8
          ? "var(--warning)"
          : "var(--info)",
  }),
  rowActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  assignmentBox: {
    borderTop: "1px solid var(--border)",
    paddingTop: "14px",
    marginTop: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  assignmentRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "10px",
  },
  assignBtn: {
    background: "rgba(52, 152, 219, 0.14)",
    color: "var(--info)",
    border: "1px solid rgba(52, 152, 219, 0.34)",
    borderRadius: "var(--radius)",
    padding: "9px 14px",
    fontSize: "0.82rem",
  },
  volunteerList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  volunteerChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(46, 204, 113, 0.1)",
    border: "1px solid rgba(46, 204, 113, 0.28)",
    borderRadius: "999px",
    color: "var(--success)",
    padding: "6px 10px",
    fontSize: "0.78rem",
    fontWeight: 600,
  },
  removeVolunteerBtn: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "rgba(230,57,70,0.16)",
    color: "#ff7c87",
    border: "1px solid rgba(230,57,70,0.32)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.68rem",
    padding: 0,
  },
  smallBtn: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "9px 14px",
    fontSize: "0.82rem",
  },
  deleteBtn: {
    background: "rgba(230,57,70,0.12)",
    color: "#ff7c87",
    border: "1px solid rgba(230,57,70,0.3)",
    borderRadius: "var(--radius)",
    padding: "9px 14px",
    fontSize: "0.82rem",
  },
  emptyState: {
    border: "1px dashed var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "28px",
    textAlign: "center",
    color: "var(--text-secondary)",
    background: "rgba(255,255,255,0.02)",
  },
};

const CampsPage = () => {
  const { user, logout } = useAuth();
  const [camps, setCamps] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [assignmentSelections, setAssignmentSelections] = useState({});
  const [assignmentLoading, setAssignmentLoading] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const loadCamps = async () => {
    setLoading(true);
    setError("");
    try {
      const [campResponse, volunteerResponse] = await Promise.all([
        api.get("/camps"),
        api.get("/auth/users?role=volunteer"),
      ]);
      setCamps(campResponse.data.data || []);
      setVolunteers(volunteerResponse.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load camp data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCamps();
  }, []);

  const totalCapacity = camps.reduce(
    (sum, camp) => sum + Number(camp.capacity || 0),
    0,
  );
  const totalOccupancy = camps.reduce(
    (sum, camp) => sum + Number(camp.currentOccupancy || 0),
    0,
  );
  const activeCamps = camps.filter((camp) => camp.isActive).length;

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    setLocating(true);
    setError("");
    setSuccess("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLocating(false);
        setSuccess("Current location added to the camp form.");
      },
      (geoError) => {
        const message =
          geoError.code === 1
            ? "Location access was denied. Please allow browser location access and try again."
            : geoError.code === 2
              ? "Current location is unavailable right now. Please try again."
              : "Location request timed out. Please try again.";

        setLocating(false);
        setError(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const capacity = Number(form.capacity);
      const currentOccupancy = Number(form.currentOccupancy);

      if (currentOccupancy > capacity) {
        throw new Error(
          "Current occupancy cannot be greater than camp capacity.",
        );
      }

      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        capacity,
        currentOccupancy,
        isActive: form.isActive === "true",
        coordinates: [Number(form.longitude), Number(form.latitude)],
      };

      if (editingId) {
        await api.put(`/camps/${editingId}`, payload);
        setSuccess("Camp updated successfully.");
      } else {
        await api.post("/camps", payload);
        setSuccess("Camp created successfully.");
      }

      resetForm();
      await loadCamps();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to save camp.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (camp) => {
    setEditingId(camp._id);
    setForm({
      name: camp.name,
      address: camp.address || "",
      latitude: camp.location?.coordinates?.[1] ?? "",
      longitude: camp.location?.coordinates?.[0] ?? "",
      capacity: camp.capacity,
      currentOccupancy: camp.currentOccupancy,
      isActive: String(Boolean(camp.isActive)),
    });
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (campId) => {
    const confirmed = window.confirm(
      "Delete this camp? Inventory linked to it will be detached, but not removed.",
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");
    try {
      await api.delete(`/camps/${campId}`);
      setSuccess("Camp deleted successfully.");
      if (editingId === campId) {
        resetForm();
      }
      await loadCamps();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete camp.");
    }
  };

  const handleAssignmentSelect = (campId, volunteerId) => {
    setAssignmentSelections((current) => ({
      ...current,
      [campId]: volunteerId,
    }));
  };

  const handleAssignVolunteer = async (campId) => {
    const volunteerId = assignmentSelections[campId];
    if (!volunteerId) {
      setError("Select a volunteer before assigning.");
      return;
    }

    setAssignmentLoading(campId);
    setError("");
    setSuccess("");
    try {
      await api.put(`/camps/${campId}/assign`, { volunteerId });
      setSuccess("Volunteer assigned to camp.");
      setAssignmentSelections((current) => ({ ...current, [campId]: "" }));
      await loadCamps();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to assign volunteer.");
    } finally {
      setAssignmentLoading(null);
    }
  };

  const handleUnassignVolunteer = async (campId, volunteerId) => {
    setAssignmentLoading(`${campId}:${volunteerId}`);
    setError("");
    setSuccess("");
    try {
      await api.put(`/camps/${campId}/unassign`, { volunteerId });
      setSuccess("Volunteer removed from camp.");
      await loadCamps();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove volunteer.");
    } finally {
      setAssignmentLoading(null);
    }
  };

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <NavTopBar
        user={user}
        onBack={() => navigate("/ngo")}
        subtitle="NGO PORTAL - RELIEF CAMP"
      />
      <div style={styles.shell}>
        <div style={styles.header}>
          <div style={styles.headerBlock}>
            <div style={styles.eyebrow}>Camp Coordination</div>
            <h1 style={styles.title}>Relief Camps</h1>
            <p style={styles.subtitle}>
              Create and manage operational camps, track occupancy, and keep
              location details ready for deployment and reporting.
            </p>
            <div style={styles.nav}>
              <Link to="/ngo" style={styles.navLink(false)}>
                Dashboard
              </Link>
              <Link to="/ngo/inventory" style={styles.navLink(false)}>
                Inventory
              </Link>
              <Link to="/ngo/camps" style={styles.navLink(true)}>
                Camps
              </Link>
            </div>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Camps</div>
            <div style={styles.statValue}>{camps.length}</div>
            <div style={styles.statHint}>
              Registered relief camps under this NGO
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active Camps</div>
            <div style={styles.statValue}>{activeCamps}</div>
            <div style={styles.statHint}>
              Currently open and receiving survivors
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Capacity</div>
            <div style={styles.statValue}>{totalCapacity}</div>
            <div style={styles.statHint}>
              Combined supported occupancy across camps
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Current Occupancy</div>
            <div style={styles.statValue}>{totalOccupancy}</div>
            <div style={styles.statHint}>
              People currently registered across camps
            </div>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <div style={styles.contentGrid}>
          <div style={styles.panel}>
            <div style={styles.panelTitleRow}>
              <h2 style={styles.panelTitle}>
                {editingId ? "Edit Camp" : "Create Camp"}
              </h2>
            </div>
            <p style={styles.panelText}>
              Record location, capacity, and live occupancy so the camp list
              stays useful for NGO operations and admin reporting.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div className="field">
                <label htmlFor="name">Camp name</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Shonarpara High School Shelter"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Road, union, upazila, district"
                />
              </div>

              <div style={styles.fieldHeader}>
                <div style={styles.fieldLabel}>Camp coordinates</div>
                <button
                  type="button"
                  style={styles.locationBtn}
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                >
                  {locating ? "Detecting..." : "Use Current Location"}
                </button>
              </div>

              <div style={styles.split}>
                <div className="field">
                  <label htmlFor="latitude">Latitude</label>
                  <input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="longitude">Longitude</label>
                  <input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div style={styles.locationHint}>
                Auto-fill from your current browser location, or enter the
                coordinates manually.
              </div>

              <div style={styles.split}>
                <div className="field">
                  <label htmlFor="capacity">Capacity</label>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="currentOccupancy">Current occupancy</label>
                  <input
                    id="currentOccupancy"
                    name="currentOccupancy"
                    type="number"
                    min="0"
                    value={form.currentOccupancy}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="isActive">Camp status</label>
                <select
                  id="isActive"
                  name="isActive"
                  value={form.isActive}
                  onChange={handleChange}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div style={styles.actions}>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update camp"
                      : "Create camp"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelTitleRow}>
              <div>
                <h2 style={styles.panelTitle}>Camp Registry</h2>
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.88rem",
                  }}
                >
                  {loading
                    ? "Refreshing data..."
                    : `${camps.length} camp records`}
                </div>
              </div>
            </div>

            {loading ? (
              <div style={styles.emptyState}>Loading camp data...</div>
            ) : camps.length === 0 ? (
              <div style={styles.emptyState}>
                No camps created yet. Use the form on the left to register your
                first relief camp.
              </div>
            ) : (
              <div style={styles.cardList}>
                {camps.map((camp) => {
                  const occupancyRatio = camp.capacity
                    ? camp.currentOccupancy / camp.capacity
                    : 0;

                  return (
                    <div key={camp._id} style={styles.campCard}>
                      <div style={styles.campTop}>
                        <div>
                          <h3 style={styles.campTitle}>{camp.name}</h3>
                          <div style={styles.campMeta}>
                            Updated {new Date(camp.updatedAt).toLocaleString()}
                          </div>
                        </div>
                        <div style={styles.badge(camp.isActive)}>
                          {camp.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>

                      <div style={styles.grid}>
                        <div>
                          <div style={styles.cellLabel}>Address</div>
                          <div style={styles.cellValue}>
                            {camp.address || "No address provided"}
                          </div>
                        </div>
                        <div>
                          <div style={styles.cellLabel}>Coordinates</div>
                          <div style={styles.cellValue}>
                            {camp.location?.coordinates?.[1]?.toFixed?.(5) ||
                              camp.location?.coordinates?.[1]}
                            ,{" "}
                            {camp.location?.coordinates?.[0]?.toFixed?.(5) ||
                              camp.location?.coordinates?.[0]}
                          </div>
                        </div>
                        <div>
                          <div style={styles.cellLabel}>
                            Volunteer Assignments
                          </div>
                          <div style={styles.cellValue}>
                            {camp.assignedVolunteers?.length || 0}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: "14px" }}>
                        <div style={styles.cellLabel}>Occupancy</div>
                        <div style={styles.progressTrack}>
                          <div style={styles.progressFill(occupancyRatio)} />
                        </div>
                        <div style={styles.cellValue}>
                          {camp.currentOccupancy} / {camp.capacity} people
                        </div>
                      </div>

                      <div style={styles.rowActions}>
                        <button
                          type="button"
                          style={styles.smallBtn}
                          onClick={() => handleEdit(camp)}
                        >
                          Edit camp
                        </button>
                        <button
                          type="button"
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(camp._id)}
                        >
                          Delete camp
                        </button>
                      </div>

                      <div style={styles.assignmentBox}>
                        <div>
                          <div style={styles.cellLabel}>Assigned volunteers</div>
                          {camp.assignedVolunteers?.length ? (
                            <div style={styles.volunteerList}>
                              {camp.assignedVolunteers.map((volunteer) => (
                                <span
                                  key={volunteer._id}
                                  style={styles.volunteerChip}
                                >
                                  {volunteer.name}
                                  <button
                                    type="button"
                                    style={styles.removeVolunteerBtn}
                                    title={`Remove ${volunteer.name}`}
                                    disabled={
                                      assignmentLoading ===
                                      `${camp._id}:${volunteer._id}`
                                    }
                                    onClick={() =>
                                      handleUnassignVolunteer(
                                        camp._id,
                                        volunteer._id,
                                      )
                                    }
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div style={styles.cellValue}>
                              No volunteers assigned yet.
                            </div>
                          )}
                        </div>

                        <div style={styles.assignmentRow}>
                          <div className="field">
                            <select
                              value={assignmentSelections[camp._id] || ""}
                              onChange={(event) =>
                                handleAssignmentSelect(
                                  camp._id,
                                  event.target.value,
                                )
                              }
                            >
                              <option value="">Select volunteer</option>
                              {volunteers.map((volunteer) => {
                                const alreadyAssigned =
                                  camp.assignedVolunteers?.some(
                                    (assigned) =>
                                      assigned._id === volunteer._id,
                                  );
                                return (
                                  <option
                                    key={volunteer._id}
                                    value={volunteer._id}
                                    disabled={alreadyAssigned}
                                  >
                                    {volunteer.name}
                                    {alreadyAssigned ? " (assigned)" : ""}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <button
                            type="button"
                            style={styles.assignBtn}
                            disabled={assignmentLoading === camp._id}
                            onClick={() => handleAssignVolunteer(camp._id)}
                          >
                            {assignmentLoading === camp._id
                              ? "Assigning..."
                              : "Assign"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampsPage;
