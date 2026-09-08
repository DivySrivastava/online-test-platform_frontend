import React, { useEffect, useRef, useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../pages/css/Navbar.css";
import { UserContext } from "../contexts/UserContext";
import refLogo from "../assets/Logo-Sahash.png";
import ProfileMenu from "./Profilemenu";

const Navbar = () => {
  const { user, loading } = useContext(UserContext);
  // State to toggle mobile menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  //console.log("User in Navbar:", user);

  //ref for mobile navi container
  const mobileNavRef = useRef(null);
  //ref for mobile navi toggle btn
  const mobileToggleRef = useRef(null);
  //ref for the navbar itself, used to measure its real height for scroll offset
  const navBarRef = useRef(null);

  //hook for programmatic navi
  const navigate = useNavigate();

  //hook for location
  const location = useLocation();

  ////to get the current pathname
  useEffect(() => {
    //console.log("Current pathname:", location.pathname)
  }, [location.pathname]);

  //toggle mobile menu open/close state
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Temporary notifications data — replace with API data later
  const notifications = [
    {
      id: 1,
      title: "New Quiz Added",
      message: "A new Science quiz has been added to the platform.",
      time: "2h ago",
    },
    {
      id: 2,
      title: "System Maintenance",
      message: "Scheduled maintenance tonight from 2 AM to 4 AM.",
      time: "5h ago",
    },
    {
      id: 3,
      title: "New Feedback Received",
      message: "A user submitted new feedback on the platform.",
      time: "1d ago",
    },
  ];

  useEffect(() => {
    const handleOutsideNotifClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("click", handleOutsideNotifClick);
    return () => document.removeEventListener("click", handleOutsideNotifClick);
  }, []);

  //to handle smooth scrolling to section
  const handleScroll = (event, sectionId) => {
    // IMPORTANT: stop the browser's default anchor (#hash) jump.
    // Without this, after our smooth-scroll-with-offset runs, the browser's
    // own native hash navigation fires right after and snaps the section to
    // the very top of the viewport (ignoring the sticky navbar), which is
    // why the gap below the navbar disappeared.
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    // Measure the navbar's actual rendered height instead of assuming a
    // fixed 64px, so the scroll gap below it always looks right.
    const getScrollOffset = () =>
      (navBarRef.current
        ? navBarRef.current.getBoundingClientRect().height
        : 64) + 16;

    //if not home page, navigate to '/' first
    if (window.location.pathname !== "/") {
      navigate("/");
      //delay scroll to allow page load
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          window.scrollTo({
            top: section.offsetTop - getScrollOffset(), // Offset for fixed navbar height
            behavior: "smooth",
          });
        }
      }, 100);
    } else {
      //scroll directly if already on home page
      const section = document.getElementById(sectionId);
      if (section) {
        window.scrollTo({
          top: section.offsetTop - getScrollOffset(),
          behavior: "smooth",
        });
      }
    }
    //close mobile menu after navigation
    setIsMenuOpen(false);
  };

  //handle login btn click
  //using provided prop and fallback navigation
  const handleLogin = () => {
    navigate("/login");
  };
  //handle signup btn click, navi to signup
  const handleSignup = () => {
    navigate("/signup");
    setIsMenuOpen(false);
  };

  //to home page
  const handleHome = () => {
    navigate("/");
  };

  // Effect to close mobile menu when clicking outside

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        mobileNavRef.current &&
        mobileToggleRef.current &&
        !mobileNavRef.current.contains(event.target) &&
        !mobileToggleRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
        //setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick); // Cleanup listener on component unmount

    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  //effect ot manage mobile menu accessiblility  attribute
  useEffect(() => {
    const mobileNav = mobileNavRef.current;
    const mobileToggle = mobileToggleRef.current;
    if (mobileNav && mobileToggle) {
      // Update ARIA attributes for accessibility

      mobileNav.setAttribute("aria-hidden", !isMenuOpen);
      mobileToggle.setAttribute("aria-expanded", isMenuOpen);
      //adjust tabIndex for mobile links based on menu state
      const mobileLinks = Array.from(mobileNav.querySelectorAll("a, button"));

      mobileLinks.forEach((link) => (link.tabIndex = isMenuOpen ? 0 : -1));
    }
  }, [isMenuOpen]);

  if (loading) return null; // Avoid early render

  const NotificationBell = (
    <div className="notification-container" ref={notificationRef}>
      <button
        type="button"
        className="notification-bell"
        onClick={(e) => {
          e.stopPropagation();
          setShowNotifications((prev) => !prev);
        }}
        aria-label="Notifications"
      >
        <svg
          viewBox="0 0 24 24"
          className="bell-icon"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2.5c-.9 0-1.6.7-1.6 1.6v.6C7.7 5.4 6 7.7 6 10.5v3.8c0 .5-.2 1-.6 1.4l-1.1 1.1c-.6.6-.2 1.7.7 1.7h14c.9 0 1.3-1.1.7-1.7l-1.1-1.1c-.4-.4-.6-.9-.6-1.4v-3.8c0-2.8-1.7-5.1-4.4-5.8v-.6c0-.9-.7-1.6-1.6-1.6z"
            fill="currentColor"
          />
          <path
            d="M9.5 19a2.5 2.5 0 0 0 5 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {showNotifications && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h4>Notifications</h4>
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications yet.</p>
            ) : (
              notifications.map((n, idx) => (
                <div
                  className="notification-item"
                  key={n.id}
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <span className="notification-dot" />
                  <div className="notification-content">
                    <h5>{n.title}</h5>
                    <p>{n.message}</p>
                    <span className="notification-time">{n.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Hide Navbar for quiz pages
  if (
    location.pathname.toLowerCase().startsWith("/quiz") ||
    location.pathname.toLowerCase().startsWith("/start-test") ||
    location.pathname.toLowerCase().startsWith("/reset-password") ||
    location.pathname.toLowerCase() === "/login" ||
    location.pathname.toLowerCase() === "/signup" ||
    location.pathname.toLowerCase() === "/dashboard/createquiz/quiz-preview"
  ) {
    return null;
  }
  // These special navbar changes (round back-arrow home button, hidden
  // landing-page links) should only apply on dashboard pages, never on
  // the public Home page navbar.
  const isDashboardRoute = location.pathname
    .toLowerCase()
    .startsWith("/dashboard");

  const isDashboardRoot = location.pathname.toLowerCase() === "/dashboard";

  const showLogoInsteadOfBack =
    location.pathname.toLowerCase() === "/dashboard" ||
    location.pathname.toLowerCase() ===
      "/dashboard/manageinstitution/institutionregistration";

  const isManageUserSubRoute =
    location.pathname
      .toLowerCase()
      .startsWith("/dashboard/manageuser/showusers") ||
    location.pathname.toLowerCase() ===
      "/dashboard/manageuser/adminregistration" ||
    location.pathname
      .toLowerCase()
      .startsWith("/dashboard/manageuser/pendingrequests");

  const isQuizDetailRoute = location.pathname
    .toLowerCase()
    .startsWith("/dashboard/managequiz/quiz-detail");

  const dashboardBackTo = isManageUserSubRoute
    ? "/dashboard/manageuser"
    : isQuizDetailRoute
      ? "/dashboard/managequiz"
      : "/dashboard";

  // Add this above the Navbar component (or as a local helper inside it)
  const getDashboardBackPath = (pathname) => {
    const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);
    if (segments.length <= 1) return "/dashboard";
    segments.pop();
    return "/" + segments.join("/");
  };

  // On the profile page and the (logged-in) reset-password page, the navbar
  // should show ONLY a "Back" button that returns the user to the dashboard —
  // no logo, no links, no profile icon.
  const isBackOnlyRoute =
    location.pathname.toLowerCase().startsWith("/profile") ||
    location.pathname.toLowerCase().startsWith("/resetpassword");

  if (isBackOnlyRoute) {
    return (
      <nav className="sahash-navbar" role="banner">
        <div
          className="nav-bar nav-container"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="logo-container">
            <Link
              to="/dashboard"
              className="home-round-btn"
              aria-label="Back to dashboard"
              title="Back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="home-round-icon"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="M11 18l-6-6 6-6" />
              </svg>
              <span className="home-round-label">Back</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    //Nav starts from here
    <nav className="sahash-navbar" role="banner" ref={navBarRef}>
      <div
        className="nav-bar nav-container"
        role="navigation"
        aria-label="Main navigation"
      >
        {showLogoInsteadOfBack ? (
          <div className="logo-container">
            <Link to="/" className="logo-link" onClick={handleHome}>
              <img src={refLogo} alt="Sahash Logo" className="nav-logo" />
              <div className="logo-text">
                <span className="sa-name">SAHASH</span>
                <span className="sa-desc">
                  <i>WE CARE ALL</i>
                </span>
              </div>
            </Link>
          </div>
        ) : isDashboardRoute ? (
          <div className="logo-container">
            <Link
              to={dashboardBackTo}
              className="home-round-btn"
              aria-label="Back to dashboard"
              title="Back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="home-round-icon"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="M11 18l-6-6 6-6" />
              </svg>
              <span className="home-round-label">Back</span>
            </Link>
          </div>
        ) : (
          <div className="logo-container">
            <Link to="/" className="logo-link" onClick={handleHome}>
              <img src={refLogo} alt="Sahash Logo" className="nav-logo" />
              <div className="logo-text">
                <span className="sa-name">SAHASH</span>
                <span className="sa-desc">
                  <i>WE CARE ALL</i>
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Mobile: notification bell + menu toggle button */}
        {!isDashboardRoute && (
          <div className="mobile-right-controls">
            {NotificationBell}

            <div
              className="menu-icon"
              onClick={toggleMenu}
              ref={mobileToggleRef}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleMenu();
                }
              }}
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
          </div>
        )}

        <>
          {/**mobile nav links shown when menu is open — only on public pages */}
          {!isDashboardRoute && (
            <div
              className={`nav-links ${isMenuOpen ? "active" : ""}`}
              ref={mobileNavRef}
              id="mobile-nav"
              aria-hidden={!isMenuOpen}
            >
              <ul className="nav-links-list">
                <li>
                  <a
                    href="#home"
                    onClick={(e) => handleScroll(e, "home")}
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#education"
                    onClick={(e) => handleScroll(e, "education")}
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    Education
                  </a>
                </li>
                <li>
                  <a
                    href="#quiz"
                    onClick={(e) => handleScroll(e, "quiz")}
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    Quiz
                  </a>
                </li>
                <li>
                  <a
                    href="#humanity-science"
                    onClick={(e) => handleScroll(e, "humanity-science")}
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    Humanity & Science
                  </a>
                </li>
                <li>
                  <a
                    href="#aboutUs"
                    onClick={(e) => handleScroll(e, "aboutUs")}
                    tabIndex={isMenuOpen ? 0 : 1}
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#FeedbackForm"
                    onClick={(e) => handleScroll(e, "feedback")}
                    tabIndex={isMenuOpen ? 0 : 1}
                  >
                    Feedback
                  </a>
                </li>
              </ul>
              {/* Mobile navigation buttons */}

              {!user && (
                <div className="nav-btns nav-btns-mobile">
                  <button
                    className="login-btn"
                    onClick={handleLogin}
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    Login
                  </button>
                  <div>
                    <button
                      className="signup-btn"
                      onClick={handleSignup}
                      tabIndex={isMenuOpen ? 0 : -1}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/**desktop nav links */}
          <div className="nav-links desktop-nav-links">
            <ul className="nav-links-list">
              <li>
                <a href="#home" onClick={(e) => handleScroll(e, "home")}>
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#education"
                  onClick={(e) => handleScroll(e, "education")}
                >
                  Education
                </a>
              </li>
              <li>
                <a href="#quiz" onClick={(e) => handleScroll(e, "quiz")}>
                  Quiz
                </a>
              </li>
              <li>
                <a
                  href="#humanity-science"
                  onClick={(e) => handleScroll(e, "humanity-science")}
                >
                  Humanity & Science
                </a>
              </li>
              <li>
                <a href="#aboutUs" onClick={(e) => handleScroll(e, "aboutUs")}>
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#FeebackForm"
                  onClick={(e) => handleScroll(e, "feedback")}
                >
                  Feedback
                </a>
              </li>
            </ul>
          </div>
          {/* Desktop navigation buttons */}

          {!isDashboardRoute &&
            (!user ? (
              <div className="nav-btns desktop-nav-btns">
                {NotificationBell}
                <button className="login-btn" onClick={handleLogin}>
                  Login
                </button>
                <button className="signup-btn" onClick={handleSignup}>
                  Sign Up
                </button>
              </div>
            ) : (
              <>
                {NotificationBell}
                <ProfileMenu user={user} />
              </>
            ))}
        </>

        {isDashboardRoute && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {NotificationBell}
            <ProfileMenu user={user} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
