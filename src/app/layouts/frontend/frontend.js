import "./frontend.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Navigate,
  useNavigate,
  Link,
  useLocation,
  Outlet,
} from "react-router-dom";
import { getNotificationsUnRead } from "../../slices/auth";
import { getAccount } from "../../slices/user";
import EventBus from "../../common/eventBus";
import TimeAgo from "react-timeago";
import moment from "moment";
import { logout } from "../../slices/auth";
import {
  LuPlus,
  LuLayoutDashboard,
  LuWaves,
  LuLifeBuoy,
  LuBell,
  LuUser,
  LuLogOut,
  LuSettings,
  LuChevronDown,
  LuGlobe,
} from "react-icons/lu";

const NavItem = ({ icon: Icon, label, to, active }) => (
  <Link
    to={to}
    className={`header-nav-item ${active ? "active" : ""}`}
  >
    <Icon size={16} />
    <span>{label}</span>
  </Link>
);

const FrontendLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user: currentUser, isLoggedIn, notificationUnread } = useSelector((state) => state.auth);
  const { me: account } = useSelector((state) => state.user);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const logOut = useCallback(() => {
    dispatch(logout())
      .unwrap()
      .finally(() => {
        navigate("/login");
        window.location.reload();
      });
  }, [dispatch]);

  useEffect(() => {
    EventBus.on("logout", () => logOut());
    return () => EventBus.remove("logout");
  }, [logOut]);

  useEffect(() => {
    if (isLoggedIn) {
      Promise.all([
        dispatch(getNotificationsUnRead({ userId: currentUser.user.id, page: 1, pageSize: 5 })),
        dispatch(getAccount({ userId: currentUser.user.id })),
      ]);
    }
  }, [isLoggedIn]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRedirect = (url) => {
    const action = new URLSearchParams(location.search).get("action");
    const returnUrl = new URLSearchParams(location.search).get("returnUrl");
    if (returnUrl) return navigate(`${url}?returnUrl=${encodeURIComponent(returnUrl)}`);
    if (action === "invited") {
      const invitedUrl = `${location.pathname}${location.search}`;
      return navigate(`${url}?returnUrl=${encodeURIComponent(invitedUrl)}`);
    }
    return navigate(url);
  };

  const unreadCount = notificationUnread?.pagination?.totalItems || 0;
  const photoUrl = account?.photoUrl || "https://app.collectly.com/public/img/user.png";

  return (
    <>
      <header className="collectly-header">
        <div className="header-inner">
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <Link to="/" className="brand-logo">
              <div className="brand-icon">
                <LuPlus size={20} strokeWidth={3} />
              </div>
              <span className="brand-name">COLLECTLY</span>
            </Link>

            {currentUser && (
              <nav className="header-nav">
                {
                  (!isLoggedIn) && (
                    <NavItem icon={LuGlobe} label="Home" to="/" active={location.pathname === "/"} />
                  )
                }

                {
                  (isLoggedIn) && (<>
                    <NavItem icon={LuLayoutDashboard} label="Dashboard" to="/dashboard" active={location.pathname === "/dashboard"} />
                    <NavItem icon={LuWaves} label="Pools" to="/pools" active={location.pathname === "/pools"} />
                    <NavItem icon={LuLifeBuoy} label="Support" to="/support" active={location.pathname === "/support"} />
                  </>
                  )
                }


              </nav>
            )}
          </div>

          {/* Right side */}
          <div className="header-right">
            {currentUser ? (
              <>
                {/* Create pool button */}
                <Link to="/pool-create" className="btn-create-pool">
                  <LuPlus size={16} strokeWidth={3} />
                  Start a Pool
                </Link>

                <div className="header-divider" />

                {/* Notifications */}
                <div ref={notifRef} style={{ position: "relative" }}>
                  <button
                    className="notification-bell-btn"
                    onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                    aria-label="Notifications"
                  >
                    <LuBell size={20} />
                    {unreadCount > 0 && (
                      <span className="notification-badge">{unreadCount}</span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="notification-dropdown">
                      <h5>Notifications</h5>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {notificationUnread?.notifications?.length > 0 ? (
                          notificationUnread.notifications.map((item, i) => (
                            <li key={i} className="notification-item">
                              <p>{item.message}</p>
                              <small>
                                <TimeAgo date={moment(item.createdAt).local().toDate()} />
                              </small>
                            </li>
                          ))
                        ) : (
                          <li style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            No new notifications
                          </li>
                        )}
                      </ul>
                      <Link
                        to="/notifications"
                        onClick={() => setShowNotifications(false)}
                        style={{
                          display: "block",
                          marginTop: "10px",
                          textAlign: "center",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "var(--brand-primary)",
                          textDecoration: "none",
                        }}
                      >
                        View all
                      </Link>
                    </div>
                  )}
                </div>

                {/* User avatar / dropdown */}
                <div ref={userMenuRef} style={{ position: "relative" }}>
                  <button
                    className={`user-avatar-btn ${location.pathname === "/account" ? "active" : ""}`}
                    onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                    aria-label="User menu"
                  >
                    <img src={photoUrl} alt="avatar" />
                  </button>

                  {showUserMenu && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 10px)",
                        right: 0,
                        minWidth: 200,
                        background: "white",
                        borderRadius: 16,
                        boxShadow: "var(--shadow-lg)",
                        border: "1px solid var(--border-color)",
                        padding: "8px",
                        zIndex: 200,
                      }}
                    >
                      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--border-color)", marginBottom: 6 }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-dark)" }}>
                          {currentUser.user.username}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {currentUser.user.email}
                        </div>
                      </div>
                      {[
                        { icon: LuUser, label: "My Account", to: "/account" },
                        { icon: LuSettings, label: "Settings", to: "/account" },
                      ].map(({ icon: Icon, label, to }) => (
                        <Link
                          key={label}
                          to={to}
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            borderRadius: 10,
                            textDecoration: "none",
                            color: "var(--text-dark)",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <Icon size={16} />
                          {label}
                        </Link>
                      ))}
                      <div style={{ borderTop: "1px solid var(--border-color)", marginTop: 6, paddingTop: 6 }}>
                        <button
                          onClick={() => { setShowUserMenu(false); logOut(); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "100%",
                            padding: "10px 14px",
                            border: "none",
                            background: "transparent",
                            borderRadius: 10,
                            color: "var(--danger)",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <LuLogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleRedirect("/login")}
                  className="btn-sign-in"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleRedirect("/register")}
                  className="btn-create-pool"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <Outlet />

      {/* Footer */}
      <footer style={{
        padding: "40px 24px",
        borderTop: "1px solid var(--border-color)",
        marginTop: "auto",
      }}>
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          color: "var(--text-muted)",
          fontSize: "0.75rem",
          fontWeight: 700,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28,
              background: "var(--brand-primary)",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white",
              transform: "rotate(12deg)",
            }}>
              <LuPlus size={14} strokeWidth={3} />
            </div>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.15em" }}>
              &copy; {new Date().getFullYear()} COLLECTLY. ALL RIGHTS RESERVED.
            </span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map((t) => (
              <a key={t} href="#" style={{
                textDecoration: "none",
                color: "var(--text-muted)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontSize: "0.7rem",
                transition: "color 0.2s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-dark)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >{t}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
};

export default FrontendLayout;
