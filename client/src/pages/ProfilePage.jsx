import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../css/ProfilePage.css";
import NavTopBar from "../components/NavTopBar";
import RatingSection from "../components/RatingSection";

const ROLE_CONFIG = {
  victim: { label: "VICTIM", color: "#e63946", bg: "rgba(230,57,70,0.15)" },
  volunteer: {
    label: "VOLUNTEER",
    color: "#3498db",
    bg: "rgba(52,152,219,0.15)",
  },
  admin: { label: "ADMIN", color: "#9b59b6", bg: "rgba(155,89,182,0.15)" },
  responder: {
    label: "RESPONDER",
    color: "#f39c12",
    bg: "rgba(243,156,18,0.15)",
  },
};

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function StarRating({ score }) {
  return (
    <div className="profile-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="profile-stars__star"
          style={{
            color: i <= Math.round(score) ? "#f39c12" : "var(--border)",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sosId = new URLSearchParams(location.search).get("sosId");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sosStatus, setSosStatus] = useState(null);

  const isOwn = !userId || userId === currentUser?._id;

  useEffect(() => {
    if (!sosId) return;
    api
      .get(`/sos/${sosId}`)
      .then((res) => setSosStatus(res.data.data?.status ?? null))
      .catch(() => setSosStatus(null));
  }, [sosId]);

  useEffect(() => {
    const endpoint = isOwn ? "/auth/me" : `auth/users/${userId}`;

    api
      .get(endpoint)
      .then((res) => setProfile(res.data.user ?? res.data.data))
      .catch(() => setError("Could not load profile."))
      .finally(() => setLoading(false));
  }, [userId]);

  const roleCfg = ROLE_CONFIG[profile?.role] ?? ROLE_CONFIG.victim;

  return (
    <div className="profile-page">
      <NavTopBar
        user={currentUser}
        onBack={() => navigate(`/${currentUser.role.toLowerCase()}`)}
        subtitle={isOwn ? "MY PROFILE VIEW" : "USER PROFILE VIEW"}
      />

      <div className="profile-content">
        {loading && <p className="profile-status-msg">Loading profile...</p>}
        {error && (
          <p className="profile-status-msg profile-status-msg--error">
            {error}
          </p>
        )}

        {profile && (
          <>
            {/* ── Profile card (unchanged) ── */}
            <div className="profile-card">
              <div className="profile-card__header">
                <div
                  className="profile-card__avatar"
                  style={{ background: roleCfg.bg, color: roleCfg.color }}
                >
                  {getInitials(profile.name)}
                </div>
                <div>
                  <div className="profile-card__name">{profile.name}</div>
                  <span
                    className="profile-card__role-badge"
                    style={{ background: roleCfg.bg, color: roleCfg.color }}
                  >
                    <div
                      className="profile-card__dot"
                      style={{ background: roleCfg.color }}
                    />
                    {roleCfg.label}
                  </span>
                </div>
              </div>

              <hr className="profile-card__divider" />

              <div className="profile-card__field-grid">
                <div>
                  <div className="profile-field__label">FULL NAME</div>
                  <div className="profile-field__value">{profile.name}</div>
                </div>
                <div>
                  <div className="profile-field__label">EMAIL</div>
                  <div className="profile-field__value--muted">
                    {profile.email}
                  </div>
                </div>
                <div>
                  <div className="profile-field__label">PHONE NUMBER</div>
                  <div className="profile-field__value">
                    {profile.phone || "—"}
                  </div>
                </div>
                <div>
                  <div className="profile-field__label">ROLE</div>
                  <div className="profile-field__value">{roleCfg.label}</div>
                </div>

                {profile.role !== "victim" &&
                  profile.isAvailable !== undefined && (
                    <div>
                      <div className="profile-field__label">AVAILABILITY</div>
                      <span
                        className={`profile-avail-badge ${
                          profile.isAvailable
                            ? "profile-avail-badge--available"
                            : "profile-avail-badge--unavailable"
                        }`}
                      >
                        <div
                          className="profile-card__dot"
                          style={{
                            background: profile.isAvailable
                              ? "#2ecc71"
                              : "#8b949e",
                          }}
                        />
                        {profile.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
                      </span>
                    </div>
                  )}
              </div>

              {/* Volunteer performance — only on volunteer profiles */}
              {profile.role === "volunteer" && (
                <div className="profile-volunteer">
                  <div className="profile-volunteer__label">
                    VOLUNTEER PERFORMANCE
                  </div>
                  <div className="profile-volunteer__grid">
                    <div>
                      <div className="profile-volunteer__metric-val">
                        {(profile.reliabilityScore ?? 0).toFixed(1)}
                      </div>
                      <StarRating score={profile.reliabilityScore ?? 0} />
                      <div className="profile-volunteer__metric-label">
                        RELIABILITY SCORE
                      </div>
                    </div>
                    <div>
                      <div className="profile-volunteer__metric-val">
                        {profile.totalRatings ?? 0}
                      </div>
                      <div className="profile-volunteer__metric-label">
                        TOTAL RATINGS
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/*
              ── Rating section ──
              Only renders when viewing a volunteer profile.
              RatingSection itself handles whether to show the form
              (victim only) or just the summary (everyone else).
            */}
            {profile.role === "volunteer" && (
              <RatingSection
                volunteerId={profile._id}
                sosId={sosId}
                sosStatus={sosStatus}
                currentRole={currentUser?.role}
                reliabilityScore={profile.reliabilityScore ?? 0}
                totalRatings={profile.totalRatings ?? 0}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
