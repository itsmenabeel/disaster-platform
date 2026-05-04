import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import NavTopBar from "../../components/NavTopBar";
import HeaderTag from "../../components/HeaderTag";

const categoryOptions = [
  "food",
  "medicine",
  "shelter",
  "water",
  "clothing",
  "other",
];

const initialForm = {
  itemName: "",
  category: "food",
  quantity: 0,
  unit: "units",
  lowStockThreshold: 10,
  camp: "",
};

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(46, 204, 113, 0.1), transparent 28%), var(--bg-base)",
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
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
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
    border: "1px solid rgba(46, 204, 113, 0.3)",
    background: "rgba(46, 204, 113, 0.1)",
    color: "var(--success)",
    fontSize: "0.75rem",
    fontFamily: "IBM Plex Mono, monospace",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    fontSize: "2.7rem",
    color: "var(--text-primary)",
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
    border: `1px solid ${active ? "rgba(46, 204, 113, 0.35)" : "var(--border)"}`,
    background: active ? "rgba(46, 204, 113, 0.12)" : "var(--bg-surface)",
    color: active ? "var(--success)" : "var(--text-secondary)",
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
    gridTemplateColumns: "minmax(320px, 380px) minmax(0, 1fr)",
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
    alignItems: "center",
    gap: "12px",
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
  split: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
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
  itemCard: (isLow) => ({
    background: isLow ? "rgba(243, 156, 18, 0.08)" : "var(--bg-elevated)",
    border: `1px solid ${isLow ? "rgba(243, 156, 18, 0.28)" : "var(--border)"}`,
    borderRadius: "var(--radius-lg)",
    padding: "18px",
  }),
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  itemTitle: {
    fontSize: "1.2rem",
  },
  itemMeta: {
    color: "var(--text-secondary)",
    fontSize: "0.87rem",
  },
  badgeRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  badge: (tone) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    background:
      tone === "danger"
        ? "rgba(243, 156, 18, 0.14)"
        : tone === "info"
          ? "rgba(52, 152, 219, 0.14)"
          : "rgba(255,255,255,0.06)",
    color:
      tone === "danger"
        ? "var(--warning)"
        : tone === "info"
          ? "var(--info)"
          : "var(--text-secondary)",
    border:
      tone === "danger"
        ? "1px solid rgba(243, 156, 18, 0.3)"
        : tone === "info"
          ? "1px solid rgba(52, 152, 219, 0.3)"
          : "1px solid var(--border)",
  }),
  itemGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "14px",
  },
  itemCellLabel: {
    color: "var(--text-muted)",
    fontSize: "0.74rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "4px",
  },
  itemCellValue: {
    fontSize: "0.92rem",
    color: "var(--text-primary)",
  },
  rowActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
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

const InventoryPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [camps, setCamps] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [inventoryRes, campRes] = await Promise.all([
        api.get("/inventory"),
        api.get("/camps"),
      ]);
      setItems(inventoryRes.data.data || []);
      setCamps(campRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalQuantity = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );
  const lowStockCount = items.filter((item) => item.isLow).length;
  const assignedToCampCount = items.filter((item) => item.camp).length;

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        itemName: form.itemName.trim(),
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit.trim() || "units",
        lowStockThreshold: Number(form.lowStockThreshold),
        camp: form.camp || null,
      };

      if (editingId) {
        await api.put(`/inventory/${editingId}`, payload);
        setSuccess("Inventory item updated successfully.");
      } else {
        await api.post("/inventory", payload);
        setSuccess("Inventory item added successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save inventory item.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      lowStockThreshold: item.lowStockThreshold,
      camp: item.camp?._id || "",
    });
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (itemId) => {
    const confirmed = window.confirm(
      "Delete this inventory item? This action cannot be undone.",
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");
    try {
      await api.delete(`/inventory/${itemId}`);
      setSuccess("Inventory item deleted successfully.");
      if (editingId === itemId) {
        resetForm();
      }
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete inventory item.",
      );
    }
  };

  const lowStockItems = items.filter((item) => item.isLow);

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <NavTopBar
        user={user}
        onBack={() => navigate("/ngo")}
        subtitle="NGO PORTAL - INVENTORY MANAGEMENT"
      />
      <div style={styles.shell}>
        <div style={styles.header}>
          <div style={styles.headerBlock}>
            <div style={styles.eyebrow}>NGO Operations</div>
            <h1 style={styles.title}>Inventory Management</h1>
            <p style={styles.subtitle}>
              Track supplies, connect stock to active camps, and catch shortages
              before they slow down relief work.
            </p>
            <div style={styles.nav}>
              <Link to="/ngo" style={styles.navLink(false)}>
                Dashboard
              </Link>
              <Link to="/ngo/inventory" style={styles.navLink(true)}>
                Inventory
              </Link>
              <Link to="/ngo/camps" style={styles.navLink(false)}>
                Camps
              </Link>
              <Link to="/ngo/distribution" style={styles.navLink(false)}>
                Distribution
              </Link>
            </div>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Tracked Items</div>
            <div style={styles.statValue}>{items.length}</div>
            <div style={styles.statHint}>
              Distinct supply records across your NGO
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Quantity</div>
            <div style={styles.statValue}>{totalQuantity}</div>
            <div style={styles.statHint}>Current units available in stock</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Low Stock Alerts</div>
            <div style={styles.statValue}>{lowStockCount}</div>
            <div style={styles.statHint}>
              Items at or below their warning threshold
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Camp Linked</div>
            <div style={styles.statValue}>{assignedToCampCount}</div>
            <div style={styles.statHint}>
              Inventory entries tied to a relief camp
            </div>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <div style={styles.contentGrid}>
          <div style={styles.panel}>
            <div style={styles.panelTitleRow}>
              <h2 style={styles.panelTitle}>
                {editingId ? "Edit Item" : "Add Inventory"}
              </h2>
            </div>
            <p style={styles.panelText}>
              Keep quantities, units, and camp allocation updated so shortage
              alerts stay accurate.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div className="field">
                <label htmlFor="itemName">Item name</label>
                <input
                  id="itemName"
                  name="itemName"
                  value={form.itemName}
                  onChange={handleChange}
                  placeholder="Rice packs, oral saline, blankets"
                  required
                />
              </div>

              <div style={styles.split}>
                <div className="field">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="unit">Unit</label>
                  <input
                    id="unit"
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    placeholder="units, boxes, liters"
                    required
                  />
                </div>
              </div>

              <div style={styles.split}>
                <div className="field">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="lowStockThreshold">Low stock threshold</label>
                  <input
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    type="number"
                    min="0"
                    value={form.lowStockThreshold}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="camp">Relief camp</label>
                <select
                  id="camp"
                  name="camp"
                  value={form.camp}
                  onChange={handleChange}
                >
                  <option value="">Unassigned stock</option>
                  {camps.map((camp) => (
                    <option key={camp._id} value={camp._id}>
                      {camp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.actions}>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update item"
                      : "Add item"}
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
                <h2 style={styles.panelTitle}>Supply Registry</h2>
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.88rem",
                  }}
                >
                  {loading
                    ? "Refreshing data..."
                    : `${items.length} inventory records`}
                </div>
              </div>
              {!!lowStockItems.length && (
                <div style={styles.badge("danger")}>
                  {lowStockItems.length} low stock
                </div>
              )}
            </div>

            {loading ? (
              <div style={styles.emptyState}>Loading inventory data...</div>
            ) : items.length === 0 ? (
              <div style={styles.emptyState}>
                No inventory has been added yet. Create your first supply record
                from the panel on the left.
              </div>
            ) : (
              <div style={styles.cardList}>
                {items.map((item) => (
                  <div key={item._id} style={styles.itemCard(item.isLow)}>
                    <div style={styles.itemTop}>
                      <div>
                        <h3 style={styles.itemTitle}>{item.itemName}</h3>
                        <div style={styles.itemMeta}>
                          Last updated{" "}
                          {new Date(item.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <div style={styles.badgeRow}>
                        <div style={styles.badge("info")}>{item.category}</div>
                        {item.isLow && (
                          <div style={styles.badge("danger")}>Low stock</div>
                        )}
                      </div>
                    </div>

                    <div style={styles.itemGrid}>
                      <div>
                        <div style={styles.itemCellLabel}>Quantity</div>
                        <div style={styles.itemCellValue}>
                          {item.quantity} {item.unit}
                        </div>
                      </div>
                      <div>
                        <div style={styles.itemCellLabel}>Threshold</div>
                        <div style={styles.itemCellValue}>
                          {item.lowStockThreshold}
                        </div>
                      </div>
                      <div>
                        <div style={styles.itemCellLabel}>Camp</div>
                        <div style={styles.itemCellValue}>
                          {item.camp?.name || "Unassigned"}
                        </div>
                      </div>
                    </div>

                    <div style={styles.rowActions}>
                      <button
                        type="button"
                        style={styles.smallBtn}
                        onClick={() => handleEdit(item)}
                      >
                        Edit item
                      </button>
                      <button
                        type="button"
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
