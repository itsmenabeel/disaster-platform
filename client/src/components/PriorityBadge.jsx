import React from "react";

const PRIORITY_META = {
  critical: {
    label: "Critical",
    color: "#e63946",
    background: "rgba(230,57,70,0.12)",
    border: "rgba(230,57,70,0.32)",
  },
  high: {
    label: "High",
    color: "#e67e22",
    background: "rgba(230,126,34,0.12)",
    border: "rgba(230,126,34,0.32)",
  },
  medium: {
    label: "Medium",
    color: "#f39c12",
    background: "rgba(243,156,18,0.12)",
    border: "rgba(243,156,18,0.32)",
  },
  low: {
    label: "Low",
    color: "#2ecc71",
    background: "rgba(46,204,113,0.12)",
    border: "rgba(46,204,113,0.32)",
  },
};

const PriorityBadge = ({ priority = "medium" }) => {
  const meta = PRIORITY_META[priority] || PRIORITY_META.medium;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "999px",
        background: meta.background,
        border: `1px solid ${meta.border}`,
        color: meta.color,
        fontSize: "0.75rem",
        fontWeight: 600,
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: meta.color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {meta.label}
    </span>
  );
};

export default PriorityBadge;
