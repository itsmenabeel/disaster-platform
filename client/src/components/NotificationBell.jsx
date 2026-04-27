import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";

const styles = {
  shell: {
    position: "relative",
    zIndex: 1100,
  },
  trigger: {
    position: "relative",
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "1px solid var(--border)",
    background: "var(--bg-surface)",
    color: "var(--text-primary)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "1rem",
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: "999px",
    background: "#e63946",
    color: "#fff",
    fontSize: "0.68rem",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
    border: "2px solid var(--bg-base)",
  },
  panel: {
    position: "absolute",
    top: 50,
    right: 0,
    width: 320,
    maxHeight: 360,
    overflowY: "auto",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border)",
    background: "var(--bg-surface)",
    boxShadow: "var(--shadow)",
    zIndex: 1100,
  },
  header: {
    padding: "14px 16px",
    borderBottom: "1px solid var(--border)",
    fontFamily: "Oswald, sans-serif",
    fontSize: "1rem",
  },
  item: (unread) => ({
    padding: "14px 16px",
    borderBottom: "1px solid var(--border)",
    background: unread ? "rgba(52,152,219,0.06)" : "transparent",
  }),
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "6px",
  },
  title: {
    fontWeight: 600,
    fontSize: "0.88rem",
    color: "var(--text-primary)",
  },
  date: {
    fontSize: "0.72rem",
    color: "var(--text-muted)",
    whiteSpace: "nowrap",
  },
  body: {
    fontSize: "0.82rem",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
  empty: {
    padding: "24px 16px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "0.82rem",
  },
};

const NotificationBell = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const userId = user?._id;

  const unreadIds = useMemo(
    () =>
      notifications
        .filter((item) => !item.readBy?.some((id) => String(id) === String(userId)))
        .map((item) => item._id),
    [notifications, userId],
  );

  const loadNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    if (!userId) return undefined;

    loadNotifications();
    const timer = setInterval(loadNotifications, 15000);
    return () => clearInterval(timer);
  }, [userId]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const markUnreadAsRead = async () => {
    if (!unreadIds.length) return;

    try {
      await Promise.all(unreadIds.map((id) => api.put(`/notifications/${id}/read`)));
      setNotifications((current) =>
        current.map((item) =>
          unreadIds.includes(item._id)
            ? {
                ...item,
                readBy: [...(item.readBy || []), userId],
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  const toggleOpen = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      await markUnreadAsRead();
    }
  };

  return (
    <div style={styles.shell} ref={rootRef}>
      <button type="button" style={styles.trigger} onClick={toggleOpen} title="Notifications">
        <span aria-hidden="true">🔔</span>
        {unreadIds.length > 0 && <span style={styles.badge}>{unreadIds.length}</span>}
      </button>

      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>Notifications</div>
          {notifications.length === 0 ? (
            <div style={styles.empty}>No notifications yet.</div>
          ) : (
            notifications.slice(0, 10).map((item) => {
              const unread = !item.readBy?.some((id) => String(id) === String(userId));

              return (
                <div key={item._id} style={styles.item(unread)}>
                  <div style={styles.titleRow}>
                    <div style={styles.title}>{item.title || "Broadcast"}</div>
                    <div style={styles.date}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={styles.body}>{item.message}</div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
