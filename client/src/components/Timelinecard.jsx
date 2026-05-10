// components/TrackRescue/TimelineCard.jsx
import React from "react";
import "../css/TrackRescue.css";
import { AlertOctagon, User, Zap, CheckCircle2 } from "lucide-react";

const TIMELINE_STEPS = [
  { key: "pending", label: "SOS Sent", icon: <AlertOctagon size={16} /> },
  { key: "assigned", label: "Volunteer Assigned", icon: <User size={16} /> },
  { key: "on_the_way", label: "Help On The Way", icon: <Zap size={16} /> },
  { key: "rescued", label: "Rescued", icon: <CheckCircle2 size={16} /> },
];

const STEP_INDEX = {
  pending: 0,
  assigned: 1,
  on_the_way: 2,
  rescued: 3,
  closed: 3,
};

const timeAgo = (dateStr) => {
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const TimelineCard = ({ status, statusColor, lastUpdated }) => {
  const stepIdx = STEP_INDEX[status] ?? 0;

  return (
    <div className="tr-card">
      <div className="tr-card__header">
        <div className="tr-card__title">Rescue Progress</div>
        {lastUpdated && (
          <span className="tr-card__meta">Updated {timeAgo(lastUpdated)}</span>
        )}
      </div>

      <div className="tr-timeline">
        {TIMELINE_STEPS.map((step, i) => {
          const state =
            i < stepIdx ? "done" : i === stepIdx ? "active" : "upcoming";

          const circleStyle = {
            background:
              state === "done"
                ? `${statusColor}30`
                : state === "active"
                  ? `${statusColor}18`
                  : undefined,
            border: `2px solid ${state !== "upcoming" ? statusColor : undefined}`,
            boxShadow:
              state === "active" ? `0 0 20px ${statusColor}55` : "none",
          };

          const labelStyle = {
            color: state !== "upcoming" ? statusColor : undefined,
          };

          const connectorStyle = {
            background: i < stepIdx ? statusColor : undefined,
            opacity: i < stepIdx ? 0.55 : 1,
          };

          return (
            <React.Fragment key={step.key}>
              <div className="tr-timeline__step">
                <div
                  className={`tr-timeline__circle tr-timeline__circle--${state}`}
                  style={circleStyle}
                >
                  {step.icon}
                </div>
                <div
                  className={`tr-timeline__label tr-timeline__label--${state}`}
                  style={labelStyle}
                >
                  {step.label}
                </div>
              </div>

              {i < TIMELINE_STEPS.length - 1 && (
                <div
                  className={`tr-timeline__connector ${i < stepIdx ? "" : "tr-timeline__connector--pending"}`}
                  style={connectorStyle}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineCard;
