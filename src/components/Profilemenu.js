import React, { useState, useRef, useEffect, useContext } from "react";
import "../pages/css/Navbar.css";
import { UserContext } from "../contexts/UserContext";
import { Link } from "react-router-dom";
import useAuth from "../utils/auth";
import { useNavigate, useLocation } from "react-router-dom";

const ProfileMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isOnHomePage = location.pathname === "/";
  const { logoutUser } = useContext(UserContext);

  //Detect monile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleScroll = (sectionId) => {
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          window.scrollTo({
            top: section.offsetTop - 64,
            behavior: "smooth",
          });
        }
      }, 500);
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        window.scrollTo({
          top: section.offsetTop - 64,
          behavior: "smooth",
        });
      }
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="profile-container" ref={menuRef}>
      {(user.role_name === "Super Admin" || user.role_name === "Admin") && (
        <img
          src={user.profilePic || "/images/admin.png"}
          alt="Profile"
          className="profile-icon"
          onClick={() => setIsOpen(!isOpen)}
        />
      )}

      {user.role_name === "Teacher" && (
        <img
          src={user.profilePic || "/images/teacher.png"}
          alt="Profile"
          className="profile-icon"
          onClick={() => setIsOpen(!isOpen)}
        />
      )}

      {user.role_name === "Student" && (
        <img
          src={user.profilePic || "/images/student.png"}
          alt="Profile"
          className="profile-icon"
          onClick={() => setIsOpen(!isOpen)}
        />
      )}

      {user.role_name === "Others" && (
        <img
          src={user.profilePic || "/images/guest.png"}
          alt="Profile"
          className="profile-icon"
          onClick={() => setIsOpen(!isOpen)}
        />
      )}

      <div className="admin-role">{user.name}</div>

      {isOpen && (
        <div className="dropdown-menu">
          <span className="profile-name">{user.username}</span>
          <hr />

          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              handleScroll("home");
            }}
          >
            Home
          </a>

          <a
            href="#aboutUs"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              handleScroll("aboutUs");
            }}
          >
            About Us
          </a>
          <Link to="/dashboard" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          <Link
            to="/profile"
            state={{ role: user.role_name }}
            onClick={() => setIsOpen(false)}
          >
            My Profile
          </Link>
          <Link to="/resetpassword" onClick={() => setIsOpen(false)}>
            Reset Password
          </Link>
          <span onClick={handleLogout}>Logout</span>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
