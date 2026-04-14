// components/Topbar.jsx
import React from "react";
import "../css/TrackRescue.css";

const TopBar = ({ onBack, user, subtitle }) => (
  <div className="tr-top-bar">
    <div className="tr-top-bar__left">
      <div className="tr-top-bar__icon">🌊</div>
      <div>
        <div className="tr-top-bar__title">DISASTER RESPONSE PLATFORM</div>
        <div className="tr-top-bar__sub">
          {subtitle || "Relief Coordination Platform"}
        </div>
      </div>
    </div>

    <div className="tr-top-bar__right">
      {user?.name && (
        <div className="tr-top-bar__user">
          <div className="tr-top-bar__user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="tr-top-bar__user-name">{user.name}</span>
        </div>
      )}

      {onBack && (
        <button className="tr-back-btn" onClick={onBack}>
          ← BACK TO DASHBOARD
        </button>
      )}
    </div>
  </div>
);

export default TopBar;
