import { useNavigate } from "react-router-dom";
import "../css/TrackRescue.css";
import { UserCheck, Phone } from "lucide-react";

const StatusVolunteerCards = ({ sos, statusCfg }) => {
  const navigate = useNavigate();
  const statusSubText =
    {
      pending:
        "Your request is live. We are finding the nearest available volunteer.",
      assigned: "A volunteer has been assigned and is preparing to reach you.",
      on_the_way:
        "Your volunteer is on the way. Stay where you are if it is safe to do so.",
      rescued: "You have been marked as rescued. Stay safe.",
      closed: "This request has been closed by the system.",
    }[sos.status] || "";

  return (
    <div className="tr-two-col">
      {/* ── Current Status ── */}
      <div
        className="tr-status-card"
        style={{
          background: statusCfg.bg,
          border: `1px solid ${statusCfg.border}`,
        }}
      >
        <div className="tr-status-card__icon">{statusCfg.icon}</div>
        <div
          className="tr-status-card__label"
          style={{ color: statusCfg.color }}
        >
          {statusCfg.label}
        </div>
        <div className="tr-status-card__sub">{statusSubText}</div>
      </div>

      {/* ── Assigned Volunteer ── */}
      <div className="tr-vol-card">
        <div className="tr-vol-card__micro-label">Assigned Volunteer</div>

        {sos.assignedVolunteer ? (
          <>
            <div className="tr-vol-card__row">
              <div
                className="tr-vol-card__avatar"
                style={{
                  background: `${statusCfg.color}20`,
                  border: `1px solid ${statusCfg.color}50`,
                }}
              >
                <UserCheck size={20} />
              </div>
              <div
                onClick={() =>
                  navigate(`/profile/${sos.assignedVolunteer._id}`)
                }
                style={{ cursor: "pointer" }}
              >
                <div className="tr-vol-card__name">
                  {sos.assignedVolunteer.name}
                </div>
                {sos.assignedVolunteer.phone && (
                  <div className="tr-vol-card__phone">
                    <Phone size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> {sos.assignedVolunteer.phone}
                  </div>
                )}
              </div>
            </div>

            <div
              className="tr-vol-card__badge"
              style={{
                background: `${statusCfg.color}12`,
                border: `1px solid ${statusCfg.color}30`,
                color: statusCfg.color,
              }}
            >
              ● VOLUNTEER ACTIVE
            </div>
          </>
        ) : (
          <div className="tr-vol-card__empty">
            No volunteer assigned yet. The system is searching for the nearest
            available responder.
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusVolunteerCards;
