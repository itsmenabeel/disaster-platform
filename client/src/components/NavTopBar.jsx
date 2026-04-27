import { useLocation, useNavigate } from "react-router-dom";
import "../css/TrackRescue.css";
import "../css/ProfilePage.css";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const NavTopBar = ({ onBack, user, subtitle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isDashboardPage = location.pathname === `/${user?.role?.toLowerCase()}`;
  return (
    <div className="tr-top-bar">
      <div className="tr-top-bar__left">
        <div className="tr-top-bar__icon">🌊</div>
        <div>
          <div className="tr-top-bar__title">DISASTER RESPONSE PLATFORM</div>
          <div className="profile-topbar__sub">
            {subtitle || "Relief Coordination Platform"}
          </div>
        </div>
      </div>

      <div className="pr-top-bar__right">
        {user && <NotificationBell user={user} />}

        {user?.name && (
          <div
            className="userInfo"
            onClick={() => navigate(`/profile`)}
            style={{ cursor: "pointer" }}
          >
            <span className="userDot"></span>

            <div className="pr-top-bar__user">
              <div className="pr-top-bar__user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="pr-top-bar__user-name">{user.name}</span>
            </div>

            <div className="roleBadge">{user.role}</div>
          </div>
        )}

        {!isDashboardPage ? (
          <button className="pr-back-btn" onClick={onBack}>
            ← BACK TO DASHBOARD
          </button>
        ) : (
          <button
            className="logoutBtn"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            SIGN OUT
          </button>
        )}
      </div>
    </div>
  );
};
export default NavTopBar;
