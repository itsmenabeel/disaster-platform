import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import useMessages from "../hooks/useMessages";
import { MessageCircle, Lock } from "lucide-react";

/* ─── Helpers ────────────────────────────────────────────────────── */
const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const isAtBottom = (el) =>
  el.scrollHeight - el.scrollTop - el.clientHeight < 10;

/* ─── Styles ─────────────────────────────────────────────────────── */
const styles = {
  wrapper: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    marginTop: "24px",
  },
  header: (hasUnread) => ({
    padding: "12px 18px",
    borderBottom: `1px solid ${hasUnread ? "rgba(243,156,18,0.35)" : "var(--border)"}`,
    fontFamily: "Oswald, sans-serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: hasUnread ? "rgba(243,156,18,0.10)" : "var(--bg-elevated)",
    userSelect: "none",
    transition: "background 0.3s ease, border-color 0.3s ease",
  }),
  unreadBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: "10px",
    background: "rgba(243,156,18,0.2)",
    border: "1px solid rgba(243,156,18,0.5)",
    color: "#f39c12",
    fontSize: "0.65rem",
    fontFamily: "IBM Plex Mono, monospace",
    fontWeight: 700,
    letterSpacing: "0.08em",
  },
  liveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "0.68rem",
    fontFamily: "IBM Plex Mono, monospace",
    fontWeight: 400,
    color: "#2ecc71",
    letterSpacing: "0.08em",
    marginLeft: "auto",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#2ecc71",
    flexShrink: 0,
  },
  messageList: {
    padding: "16px",
    maxHeight: "300px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  row: (isOwn) => ({
    display: "flex",
    justifyContent: isOwn ? "flex-end" : "flex-start",
  }),
  bubble: (isOwn) => ({
    maxWidth: "72%",
    background: isOwn ? "rgba(52,152,219,0.15)" : "var(--bg-elevated)",
    border: `1px solid ${isOwn ? "rgba(52,152,219,0.35)" : "var(--border)"}`,
    borderRadius: isOwn ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
    padding: "10px 14px",
  }),
  senderName: {
    fontSize: "0.68rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
    marginBottom: "4px",
    textTransform: "capitalize",
    letterSpacing: "0.04em",
  },
  content: {
    fontSize: "0.88rem",
    lineHeight: 1.55,
    color: "var(--text-primary)",
    wordBreak: "break-word",
  },
  time: {
    fontSize: "0.65rem",
    color: "var(--text-muted)",
    marginTop: "5px",
    textAlign: "right",
    fontFamily: "IBM Plex Mono, monospace",
  },
  form: {
    display: "flex",
    gap: "8px",
    padding: "12px 16px",
    borderTop: "1px solid var(--border)",
    background: "var(--bg-elevated)",
  },
  input: {
    flex: 1,
    background: "var(--bg-base)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "9px 14px",
    color: "var(--text-primary)",
    fontSize: "0.88rem",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.18s ease",
  },
  sendBtn: (disabled) => ({
    padding: "9px 18px",
    borderRadius: "var(--radius)",
    background: disabled ? "var(--bg-elevated)" : "rgba(52,152,219,0.18)",
    border: `1px solid ${disabled ? "var(--border)" : "rgba(52,152,219,0.4)"}`,
    color: disabled ? "var(--text-muted)" : "#3498db",
    fontFamily: "Oswald, sans-serif",
    fontSize: "0.85rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    cursor: disabled ? "not-allowed" : "pointer",
    flexShrink: 0,
    transition: "all 0.18s ease",
  }),
  closedNote: {
    padding: "10px 16px",
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
    borderTop: "1px solid var(--border)",
    textAlign: "center",
    letterSpacing: "0.04em",
  },
  centerMsg: {
    color: "var(--text-muted)",
    fontSize: "0.83rem",
    textAlign: "center",
    padding: "24px 0",
    fontFamily: "IBM Plex Mono, monospace",
    letterSpacing: "0.03em",
  },
};

const MessageThread = ({ sosId, isActive }) => {
  const { user } = useAuth();
  const { messages, loading, error, sending, sendMessage } = useMessages(
    sosId,
    isActive,
  );

  const [draft, setDraft] = useState("");
  const [hasUnread, setHasUnread] = useState(false);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  // Tracks whether the very first fetch has completed yet.
  // The initial load should never be treated as "unread", the user just
  // opened the page and is actively looking at it.
  const isInitialLoadRef = useRef(true);

  // Scroll & unread tracking
  useEffect(() => {
    const isNewMessages = messages.length > prevMessageCountRef.current;

    if (isNewMessages && listRef.current) {
      if (isInitialLoadRef.current) {
        // First batch of messages
        listRef.current.scrollTop = listRef.current.scrollHeight;
        localStorage.setItem(`chatRead_${sosId}`, Date.now().toString());
        isInitialLoadRef.current = false;
      } else {
        // Subsequent poll
        if (isAtBottom(listRef.current)) {
          // User is actively watching
          listRef.current.scrollTop = listRef.current.scrollHeight;
          localStorage.setItem(`chatRead_${sosId}`, Date.now().toString());
        } else {
          // User scrolled up to read older messages
          setHasUnread(true);
          localStorage.setItem(`chatLastMsg_${sosId}`, Date.now().toString());
        }
      }
    } else if (isInitialLoadRef.current) {
      // Initial fetch returned zero messages
      isInitialLoadRef.current = false;
      localStorage.setItem(`chatRead_${sosId}`, Date.now().toString());
    }

    prevMessageCountRef.current = messages.length;
  }, [messages, sosId]);

  // Clear unread when user scrolls back to the bottom
  const handleListScroll = () => {
    if (!listRef.current || !hasUnread) return;
    if (isAtBottom(listRef.current)) {
      setHasUnread(false);
      localStorage.setItem(`chatRead_${sosId}`, Date.now().toString());
    }
  };

  // Send
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    try {
      await sendMessage(trimmed);
      setDraft("");
      // User is actively engaged
      setHasUnread(false);
      localStorage.setItem(`chatRead_${sosId}`, Date.now().toString());
      inputRef.current?.focus();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send message.");
    }
  };

  // Allow Ctrl+Enter / Cmd+Enter to submit
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSend(e);
    }
  };

  const isSendDisabled = sending || !draft.trim();

  return (
    <div style={styles.wrapper}>
      {/* Header — turns amber when there are unread messages */}
      <div style={styles.header(hasUnread)}>
        <MessageCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} /> RESCUE CHAT
        {hasUnread && <span style={styles.unreadBadge}>NEW</span>}
        {isActive && (
          <span style={styles.liveBadge}>
            <span style={styles.liveDot} />
            LIVE
          </span>
        )}
      </div>

      {/* Message list */}
      <div ref={listRef} style={styles.messageList} onScroll={handleListScroll}>
        {loading ? (
          <div style={styles.centerMsg}>Loading messages…</div>
        ) : error ? (
          <div style={{ ...styles.centerMsg, color: "#e63946" }}>{error}</div>
        ) : messages.length === 0 ? (
          <div style={styles.centerMsg}>
            No messages yet.{" "}
            {isActive
              ? `Send one to coordinate with your ${user.role === "victim" ? "volunteer" : "victim"}.`
              : "The chat history is empty."}
          </div>
        ) : (
          messages.map((msg) => {
            const senderId =
              typeof msg.sender === "object" ? msg.sender._id : msg.sender;
            const isOwn = senderId?.toString() === user._id?.toString();

            return (
              <div key={msg._id} style={styles.row(isOwn)}>
                <div style={styles.bubble(isOwn)}>
                  {!isOwn && (
                    <div style={styles.senderName}>
                      {typeof msg.sender === "object"
                        ? `${msg.sender.name} · ${msg.sender.role}`
                        : "Unknown"}
                    </div>
                  )}
                  <div style={styles.content}>{msg.content}</div>
                  <div style={styles.time}>{formatTime(msg.createdAt)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input form — shown only while the SOS is still active */}
      {isActive ? (
        <form onSubmit={handleSend} style={styles.form}>
          <input
            ref={inputRef}
            style={styles.input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(52,152,219,0.5)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
            placeholder="Type a message… (Ctrl+Enter to send)"
            maxLength={500}
            disabled={sending}
            autoComplete="off"
          />
          <button
            type="submit"
            style={styles.sendBtn(isSendDisabled)}
            disabled={isSendDisabled}
          >
            {sending ? "…" : "SEND"}
          </button>
        </form>
      ) : (
        <div style={styles.closedNote}>
          <Lock size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> This request is resolved — chat is read-only.
        </div>
      )}
    </div>
  );
};

export default MessageThread;
