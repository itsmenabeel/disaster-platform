const styles = {
  tag: {
    display: "inline-block",
    background: "rgba(52,152,219,0.12)",
    border: "1px solid rgba(52,152,219,0.3)",
    borderRadius: "4px",
    padding: "3px 10px",
    fontSize: "0.7rem",
    fontFamily: "IBM Plex Mono, monospace",
    color: "#3498db",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
};

const HeaderTag = ({ subtitle }) => (
  <div style={styles.tag}>{subtitle || "⬤ DASHBOARD"}</div>
);

export default HeaderTag;
