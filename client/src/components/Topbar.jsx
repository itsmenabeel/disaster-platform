// components/TrackRescue/TopBar.jsx
import React from "react";
import "../css/TrackRescue.css";

const TopBar = ({ onBack }) => (
  <div className="tr-top-bar">
    <div className="tr-top-bar__left">
      <div className="tr-top-bar__icon">🌊</div>
      <div>
        <div className="tr-top-bar__title">DISASTER RESPONSE PLATFORM</div>
        <div className="tr-top-bar__sub">VICTIM PORTAL — LIVE TRACKING</div>
      </div>
    </div>
    {onBack && (
      <button className="tr-back-btn" onClick={onBack}>
        ← BACK TO DASHBOARD
      </button>
    )}
  </div>
);

export default TopBar;
