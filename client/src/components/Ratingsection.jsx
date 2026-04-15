import React, { useState } from "react";
import api from "../services/api";
import "../css/Ratingsection.css";

const SCORE_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div>
      <div className="rating-form__stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`rating-form__star${
              i <= active ? " rating-form__star--active" : ""
            }`}
            onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
          >
            ★
          </span>
        ))}
      </div>
      <p className="rating-form__hint">
        {active
          ? `${active} / 5 — ${SCORE_LABELS[active]}`
          : "Tap a star to rate"}
      </p>
    </div>
  );
}

function SummaryStars({ score }) {
  return (
    <div className="rating-section__stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={
            i <= Math.round(score)
              ? "rating-section__star--filled"
              : "rating-section__star--empty"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

const RatingSection = ({
  volunteerId,
  sosId,
  sosStatus,
  currentRole,
  reliabilityScore = 0,
  totalRatings = 0,
}) => {
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);
  const [hasRated, setHasRated] = useState(false);

  const [liveScore, setLiveScore] = useState(reliabilityScore);
  const [liveTotal, setLiveTotal] = useState(totalRatings);

  const isVictim = currentRole === "victim";
  const canRate = isVictim && sosId && sosStatus === "rescued";

  const handleSubmit = async () => {
    if (score === 0 || submitting || !sosId) return;

    setSubmitting(true);
    setSubmitMsg(null);

    try {
      const res = await api.put(`/volunteer/${volunteerId}/rate`, {
        score,
        sosId, // ✅ SEND SOS ID
      });

      const { reliabilityScore: newScore, totalRatings: newTotal } =
        res.data.data;

      setLiveScore(newScore);
      setLiveTotal(newTotal);
      setHasRated(true);

      setSubmitMsg({
        type: "success",
        text: "Thank you! Your rating has been submitted.",
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setSubmitMsg({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rating-section">
      {/* ── Section label ── */}
      <div className="rating-section__label">RELIABILITY RATING</div>

      {/* ── Summary ── */}
      {liveTotal > 0 ? (
        <div className="rating-section__summary">
          <div className="rating-section__avg">{liveScore.toFixed(1)}</div>
          <div>
            <SummaryStars score={liveScore} />
            <div className="rating-section__count">
              {liveTotal} RATING{liveTotal !== 1 ? "S" : ""}
            </div>
          </div>
        </div>
      ) : (
        <p className="rating-section__no-ratings">No ratings yet.</p>
      )}

      {/* ── Show message if victim but no SOS ── */}
      {isVictim && sosId && sosStatus !== "rescued" && sosStatus !== null && (
        <p className="rating-section__no-ratings">
          Rating is only available once the rescue is complete.
        </p>
      )}
      {isVictim && !sosId && (
        <p className="rating-section__no-ratings">
          You can only rate a volunteer from a SOS request.
        </p>
      )}

      {/* ── Rating Form ── */}
      {canRate && !hasRated && (
        <div className="rating-form">
          <div className="rating-form__title">RATE THIS VOLUNTEER</div>

          <StarPicker value={score} onChange={setScore} />

          {submitMsg && (
            <p
              className={`rating-form__msg rating-form__msg--${submitMsg.type}`}
            >
              {submitMsg.text}
            </p>
          )}

          <button
            className="rating-form__submit"
            onClick={handleSubmit}
            disabled={score === 0 || submitting}
          >
            {submitting ? "SUBMITTING…" : "SUBMIT RATING"}
          </button>
        </div>
      )}

      {/* ── Already rated ── */}
      {canRate && hasRated && (
        <div className="rating-form__already-rated">
          ✓ You have rated this volunteer.
        </div>
      )}
    </div>
  );
};

export default RatingSection;
