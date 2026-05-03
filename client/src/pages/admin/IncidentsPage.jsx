import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import NavTopBar from "../../components/NavTopBar";

const emptyForm = {
  title: "",
  disasterType: "flood",
  address: "",
  description: "",
  startDate: "",
  status: "active",
  latitude: "23.7",
  longitude: "90.4",
};

const styles = {
  page: { minHeight: "100vh", background: "var(--bg-base)" },
  content: {
    maxWidth: "980px",
    margin: "0 auto",
    padding: "40px 24px 60px",
  },
  title: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "2rem",
    marginBottom: "8px",
  },
  text: {
    color: "var(--text-secondary)",
    marginBottom: "22px",
  },
  shell: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)",
    gap: "18px",
    alignItems: "start",
  },
  panel: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "20px",
  },
  panelTitle: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.1rem",
    marginBottom: "12px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  split: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
  },
  textarea: {
    width: "100%",
    minHeight: "110px",
    padding: "10px 12px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
    resize: "vertical",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
  },
  primaryBtn: {
    flex: 1,
    padding: "10px 14px",
    border: "none",
    borderRadius: "var(--radius)",
    background: "var(--accent)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--bg-surface)",
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  card: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "18px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "10px",
  },
  cardMeta: {
    color: "var(--text-secondary)",
    fontSize: "0.84rem",
    lineHeight: 1.6,
  },
  cardActions: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },
  smallBtn: {
    padding: "8px 12px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--bg-elevated)",
    color: "var(--text-primary)",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "8px 12px",
    borderRadius: "var(--radius)",
    border: "1px solid rgba(230,57,70,0.3)",
    background: "rgba(230,57,70,0.12)",
    color: "#e63946",
    cursor: "pointer",
  },
  empty: {
    color: "var(--text-muted)",
    fontSize: "0.85rem",
  },
};

const IncidentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const [incidents, setIncidents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadIncidents = async () => {
    const response = await api.get("/incidents");
    setIncidents(response.data.data || []);
  };

  useEffect(() => {
    loadIncidents().catch(console.error);
  }, []);

  const startEdit = (incident) => {
    setEditingId(incident._id);
    setForm({
      title: incident.title || "",
      disasterType: incident.disasterType || "flood",
      address: incident.address || "",
      description: incident.description || "",
      startDate: incident.startDate ? incident.startDate.slice(0, 10) : "",
      status: incident.status || "active",
      latitude: String(incident.location?.coordinates?.[1] ?? "23.7"),
      longitude: String(incident.location?.coordinates?.[0] ?? "90.4"),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submitEdit = async (event) => {
    event.preventDefault();

    try {
      await api.put(`/incidents/${editingId}`, {
        title: form.title,
        disasterType: form.disasterType,
        address: form.address,
        description: form.description,
        startDate: form.startDate,
        status: form.status,
        coordinates: [Number(form.longitude), Number(form.latitude)],
      });

      resetEdit();
      loadIncidents();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update incident");
    }
  };

  const deleteIncident = async (incidentId) => {
    if (!window.confirm("Delete this incident?")) return;

    try {
      await api.delete(`/incidents/${incidentId}`);
      if (editingId === incidentId) {
        resetEdit();
      }
      loadIncidents();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete incident");
    }
  };

  return (
    <div style={styles.page}>
      <NavTopBar
        user={user}
        onBack={() => navigate(`/${user?.role}`)}
        subtitle="INCIDENT HISTORY"
      />

      <div style={styles.content}>
        <div style={styles.title}>Incident History</div>
        <div style={styles.text}>
          {isAdmin
            ? "Update or remove incident records while keeping the existing create flow unchanged."
            : "Browse the latest incident archive. This page is read-only for your role."}
        </div>

        <div style={styles.shell}>
          {isAdmin && (
            <div style={styles.panel}>
              <div style={styles.panelTitle}>Edit Incident</div>
              {editingId ? (
                <form style={styles.form} onSubmit={submitEdit}>
                  <input
                    style={styles.input}
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="Title"
                    required
                  />

                  <select
                    style={styles.input}
                    value={form.disasterType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        disasterType: event.target.value,
                      }))
                    }
                  >
                    <option value="flood">Flood</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="fire">Fire</option>
                    <option value="cyclone">Cyclone</option>
                    <option value="landslide">Landslide</option>
                    <option value="other">Other</option>
                  </select>

                  <input
                    style={styles.input}
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, address: event.target.value }))
                    }
                    placeholder="Location"
                  />

                  <input
                    type="date"
                    style={styles.input}
                    value={form.startDate}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, startDate: event.target.value }))
                    }
                    required
                  />

                  <select
                    style={styles.input}
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, status: event.target.value }))
                    }
                  >
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <div style={styles.split}>
                    <input
                      type="number"
                      step="any"
                      style={styles.input}
                      value={form.latitude}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, latitude: event.target.value }))
                      }
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      step="any"
                      style={styles.input}
                      value={form.longitude}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, longitude: event.target.value }))
                      }
                      placeholder="Longitude"
                    />
                  </div>

                  <textarea
                    style={styles.textarea}
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Description"
                  />

                  <div style={styles.buttonRow}>
                    <button type="submit" style={styles.primaryBtn}>
                      Save Changes
                    </button>
                    <button type="button" style={styles.secondaryBtn} onClick={resetEdit}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={styles.empty}>Select an incident to edit.</div>
              )}
            </div>
          )}

          <div style={styles.list}>
            {incidents.length === 0 ? (
              <div style={styles.empty}>No incidents found.</div>
            ) : (
              incidents.map((incident) => (
                <div key={incident._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div>
                      <strong>{incident.title}</strong>
                      <div style={styles.cardMeta}>
                        {incident.address || "Location not provided"}
                      </div>
                    </div>
                    <div style={styles.cardMeta}>
                      {new Date(incident.startDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={styles.cardMeta}>
                    Type: {incident.disasterType}
                    <br />
                    Status: {incident.status}
                    <br />
                    Description: {incident.description || "N/A"}
                  </div>

                  {isAdmin && (
                    <div style={styles.cardActions}>
                      <button style={styles.smallBtn} onClick={() => startEdit(incident)}>
                        Edit
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => deleteIncident(incident._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentsPage;
