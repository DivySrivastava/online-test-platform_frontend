import React, { useState, useRef, useEffect, useContext } from 'react';
import '../pages/css/Navbar.css';
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
  const isOnHomePage = location.pathname === '/';
  const { logoutUser } = useContext(UserContext);

  //Detect monile screen size
  useEffect(()=>{
    const checkMobile = ()=> setIsMobile(window.innerWidth<= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return ()=> window.removeEventListener('resize', checkMobile);
  },[]);

  const handleScroll = (sectionId) => {
    console.log(`Attempting to scroll to: ${sectionId}`); // Debug log
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          console.log(`Scrolling to section: ${sectionId}`); // Debug log
          window.scrollTo({
            top: section.offsetTop - 64,
            behavior: 'smooth',
          });
        } else {
          console.warn(`Section ${sectionId} not found after navigation.`);
        }
      }, 500);
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        console.log(`Scrolling to section: ${sectionId}`); // Debug log
        window.scrollTo({
          top: section.offsetTop - 64,
          behavior: 'smooth',
        });
      } else {
        console.warn(`Section ${sectionId} not found on current page.`);
      }
    }
    setIsOpen(false); // Close dropdown after navigation
  };


  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("user");
  //   localStorage.removeItem("username");
  //   window.location.href = "/";
  // };

const handleLogout = () => {
  logoutUser();
};

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {   
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    console.log("Role name =", user.role_name);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="profile-container" ref={menuRef}>
      {(user.role_name === "Super Admin" || user.role_name === "Admin") && (
        <img
          src={user.profilePic || '/images/admin.png'}
          alt="Profile"
          className="profile-icon"
          onClick={() => setIsOpen(!isOpen)}
        />
      )}

      {user.role_name === "Teacher" && (
        <img
          src={user.profilePic || '/images/teacher.png'}
          alt="Profile"
          className="profile-icon"
          onClick={() => setIsOpen(!isOpen)}
        />
      )}

      {(user.role_name === "Student") && (
        <img
          src={user.profilePic || '/images/student.png'}
          alt="Profile"
          className="profile-icon"
          onClick={() => setIsOpen(!isOpen)}
        />
      )}

      {(user.role_name === "Others") && (
        <img
          src={user.profilePic || '/images/guest.png'}
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
          {isOnHomePage && <a href="/dashboard">My Dashboard</a>}
          {!isOnHomePage && (
            <>
              <Link to="/profile" state={{ role: user.role_name }}>
                My Profile
              </Link>
              <a href="/resetpassword">Reset Password</a>
              <span onClick={handleLogout}>Logout</span>
            </>
          )}
           {/* <a href="#education" onClick={() => handleScroll('education')}>
                Education
              </a>
               <a href="#quiz" onClick={() => handleScroll('quiz')}>
                Quiz
              </a>
               <a href="#humanity-science" onClick={() => handleScroll('humanity-science')}>
                Humanity & Science
              </a>
            
              <a href="#aboutUs" onClick={() => handleScroll('aboutUs')}>
                About Us
              </a>
            
              <a href="#FeebackForm" onClick={() => handleScroll('feedback')}>
                Feedback 
              </a> */}
          
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;