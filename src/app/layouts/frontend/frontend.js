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
import {
  getNotificationsUnRead
} from "../../slices/auth";
import {
  getAccount
} from "../../slices/user";
import EventBus from "../../common/eventBus";
import TimeAgo from "react-timeago";
import moment from "moment";
import Switch from "react-switch";
import { setHomeView } from "../../slices/general";
import { logout } from "../../slices/auth";
import Overlay from 'react-bootstrap/Overlay';


const FrontendLayout = () => {
  let navigate = useNavigate();
  const searchParams = useLocation();
  const dispatch = useDispatch();
  const { user: currentUser, isLoggedIn, notificationUnread } = useSelector((state) => state.auth);
  const { me: account } = useSelector((state) => state.user);
  const [show, setShow] = useState(false);
  const target = useRef(null);

  const logOut = useCallback(() => {

    dispatch(logout())
      .unwrap().finally(() => {
        navigate("/login")
        window.location.reload();
      });

  }, [dispatch]);

  useEffect(() => {
    EventBus.on("logout", () => {
      logOut();
    });

    return () => {
      EventBus.remove("logout");
    };
  }, [logOut]);

  useEffect(() => {
    if (isLoggedIn) {
      Promise.all([
        dispatch(getNotificationsUnRead({ userId: currentUser.user.id, page: 1, pageSize: 5 })),
        dispatch(getAccount({ userId: currentUser.user.id }))
      ]);
    }
  }, [isLoggedIn]);

  function utcToLocal(utcdateTime) {
    var localDateTime = moment(utcdateTime).local();
    return localDateTime;
  }

  const handleRedirect = (url) => {
    const action = new URLSearchParams(searchParams.search).get("action");
    const returnUrl = new URLSearchParams(searchParams.search).get("returnUrl");

    if (returnUrl) {
      return navigate(`${url}?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else if (action === 'invited') {
      let invitedUrl = `${searchParams.pathname}${searchParams.search}`;
      return navigate(`${url}?returnUrl=${encodeURIComponent(invitedUrl)}`);
    }
    return navigate(`${url}`);
  }



  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white-70 sticky-top border-bottom shadow-soft">
        <div className="container-xl px-3 px-md-4 py-2 d-flex align-items-center justify-content-between">
          {/* Left side - Logo/Brand */}
          <div className="d-flex align-items-center gap-2">
            <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
              <img
                src="assets/img/logo.png"
                alt="Logo"
                className="navbar-brand-logo"
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}></img>
              <div>
                <div className="text-xs uppercase tracking-tight text-slate-500">Collectly</div>
              </div>
            </Link>
          </div>

          {/* Center - Navigation Links */}
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav mx-auto">
              {currentUser && (
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                </li>
              )}
              {currentUser && (
                <li className="nav-item">
                  <Link to="/pools" className="nav-link">
                    Pools
                  </Link>
                </li>
              )}
              {currentUser && (
                <li className="nav-item">
                  <Link to="/support" className="nav-link">
                    Support
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Right side - User Controls */}
          <div className="d-flex align-items-center gap-3">
            {/* Notification Bell */}
            {currentUser && (
              <div className="position-relative">
                <i
                  className="bi bi-bell text-slate-500"
                  aria-hidden="true"
                  ref={target}
                  onClick={() => setShow(!show)}
                  style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                ></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notificationUnread?.pagination?.totalItems || 0}
                </span>

                <Overlay target={target.current} show={show} placement="bottom">
                  {(props) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        position: 'absolute',
                        background: '#FFFFFF',
                        padding: '15px',
                        borderRadius: '10px',
                        width: '350px',
                        boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                        zIndex: 1050
                      }}
                    >
                      <h5 className="text-title-2 text-center mb-3">Notifications</h5>
                      <ul className="notification-items mb-0 list-unstyled">
                        {notificationUnread?.notifications?.map((item, index) => (
                          <li key={index} className="py-2 border-bottom">
                            <a href="#" className="text-decoration-none">
                              <p className="text-body-2 mb-0">{item.message}</p>
                              <small className="text-muted">
                                <TimeAgo date={utcToLocal(new Date(item.createdAt))} />
                              </small>
                            </a>
                          </li>
                        ))}
                      </ul>
                      <br></br>
                      <Link to={`/notifications`} className="btn btn-sm btn-outline-secondary rounded-xl text-center">
                        View
                      </Link>
                    </div>
                  )}
                </Overlay>
              </div>
            )}

            {/* User Dropdown */}
            {currentUser && (
              <div className="dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  id="navbarUserDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    className="user-avatar rounded-circle me-2"
                    src={account.photoUrl || 'https://app.collectly.com/public/img/user.png'}
                    alt="user-avatar"
                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                  />
                  <span className="d-none d-md-inline">{currentUser.user.username}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarUserDropdown">
                  <li>
                    <Link to="/account" className="dropdown-item">
                      <i className="bi bi-person me-2"></i> My Account
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link className="dropdown-item" onClick={logOut}>
                      <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            {/* Login/Signup Buttons */}
            {!currentUser && (
              <>
                <button
                  onClick={() => handleRedirect("/login")}
                  className="btn btn-sm btn-outline-primary rounded-xl"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleRedirect("/register")}
                  className="btn btn-sm btn-primary rounded-xl"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default FrontendLayout;
