import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./css/Manageusers.css";

const ManageUsers = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  const buttonRef = useRef(null);
  const filterRef = useRef(null);
  const [userCounts, setUserCounts] = useState({});

  //Fetch Admin Count
  useEffect(() => {
    axios
      .get(`${API_URL}/user/get-user-count`)
      .then((res) => setUserCounts(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  // 🔹 Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // 🔹 Tiles
  const tiles = [
    {
      id: 1,
      title: "Create Admin",
      description: "Add New Member as an Admin",
      icon: "admin.png",
    },
    {
      id: 2,
      title: "Show Users",
      description: "To see all type of users",
      icon: "group.png",
    },
    {
      id: 3,
      title: "Pending Request",
      description: "To get Information about pending requests",
      icon: "pending.png",
    },
  ];

  // 🔹 Sidebar Menu
  const menuItemsByRole = [
    { id: 1, title: "Dashboard", pagename: "dashboard", icon: "home.png" },
    {
      id: 2,
      title: "Manage Users",
      pagename: "manageusers",
      icon: "group.png",
    },
    {
      id: 3,
      title: "Total Quizzes",
      pagename: "totalquizzes",
      icon: "quiz.png",
    },
    {
      id: 4,
      title: "Active Quizzes",
      pagename: "activequizzes",
      icon: "planning.png",
    },
    { id: 5, title: "Create Quiz", pagename: "createquiz", icon: "edit.png" },
    {
      id: 6,
      title: "Total Institutions",
      pagename: "totalinstitutions",
      icon: "school.png",
    },
    {
      id: 7,
      title: "Test Details",
      pagename: "testdetails",
      icon: "report.png",
    },
  ];

  // 🔹 Tile Click Handler
  const handleTileClick = (id) => {
    if (id === 1) {
      navigate("/dashboard/manageuser/adminregistration");
    }

    if (id === 2) {
      navigate("/dashboard/manageuser/showusers");
    }

    if (id === 3) {
      navigate("/dashboard/manageuser/pendingrequests");
    }
  };

  return (
    <div className="manageuser-page">
      {/* Left Sidebar */}
      {/* <section className={`dashboard-left-section ${menuOpen ? "open" : ""}`}>
        
        <div className='announce-head-icon'>
          <h2 id="announcements-heading">Menu →</h2>
        </div>

        <div className={`menu-scroll menu-container ${menuOpen ? "active" : ""}`}>
          {menuItemsByRole.map((item) => (
            <Link to={`/${item.pagename}`} key={item.id} className='menu-item'>
              <img src={`/images/${item.icon}`} className="mgt-icon" alt={item.title} />
              
              <div className='menu-item-text'>
                <h4>{item.title}</h4>
                {item.total && <p>{item.total}</p>}
              </div>

              <span className="menu-arrow">→</span>
            </Link>
          ))}
        </div>

      </section> */}

      {/* Main Section */}
      <div className="main-manageuser-section">
        {/* Header */}
        <div className="manageuser-header" ref={filterRef}>
          <h1>Users</h1>

          <div className="menu-mnguser-wrapper">
            <button
              ref={buttonRef}
              onClick={() => setMenuOpen(!menuOpen)}
              className="menu-toggle-btn"
            >
              <img src="/images/home.png" className="mnguser-icon" alt="menu" />
            </button>

            {menuOpen && (
              <div className="manageuser-filter-menu" ref={filterRef}>
                {menuItemsByRole.map((item) => (
                  <Link
                    to={`/dashboard/${item.pagename}`}
                    key={item.id}
                    className="manageuser-filter-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <img
                      src={`/images/${item.icon}`}
                      className="mnguser-filter-icon"
                      alt={item.title}
                    />

                    <span>{item.title}</span>

                    <span className="menu-arrow">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mnguser-mgt-grid">
          <div className="mnguser-mgt">
            <img
              src="/images/admin.png"
              alt="Admins"
              className="mnguser-icon"
            />
            <h2>Admins</h2>
            <p>{userCounts.total_admins}</p>
          </div>

          <div className="mnguser-mgt">
            <img
              src="/images/teacher.png"
              alt="Teachers"
              className="mnguser-icon"
            />
            <h2>Teachers</h2>
            <p>{userCounts.total_teachers}</p>
          </div>

          <div className="mnguser-mgt">
            <img
              src="/images/student.png"
              alt="Students"
              className="mnguser-icon"
            />
            <h2>Students</h2>
            <p>{userCounts.total_students}</p>
          </div>

          <div className="mnguser-mgt">
            <img
              src="/images/student.png"
              alt="Users"
              className="mnguser-icon"
            />
            <h2>Normal Users</h2>
            <p>{userCounts.total_guests}</p>
          </div>
        </div>

        {/* Tiles Section */}
        <div className="manageuser-containers">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className="manageuser-card"
              onClick={() => handleTileClick(tile.id)}
            >
              <img
                src={`/images/${tile.icon}`}
                alt={tile.title}
                className="manageuser-icon"
              />
              <h3>{tile.title}</h3>
              <p>{tile.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
