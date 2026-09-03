import React, { useEffect, useRef, useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../pages/css/Navbar.css";
import { UserContext } from "../contexts/UserContext";
import refLogo from "../assets/Logo-Sahash.png";
import ProfileMenu from "./Profilemenu"; // adjust the path

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

        {/* Mobile menu toggle button */}
        {!isDashboardRoute && !user && (
          <div
            className="menu-icon"
            onClick={toggleMenu}
            ref={mobileToggleRef}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
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
                <button className="login-btn" onClick={handleLogin}>
                  Login
                </button>
                <button className="signup-btn" onClick={handleSignup}>
                  Sign Up
                </button>
              </div>
            ) : (
              <ProfileMenu user={user} />
            ))}
        </>

        {isDashboardRoute && <ProfileMenu user={user} />}
      </div>
    </nav>
  );
};

export default Navbar;
