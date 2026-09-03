import React from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import getLoggedInUser from "../utils/auth"; // Import the function to get username
import Tiles from "../Tiles"; // Import panelss Component
import { Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";
//import Delete-icon from '../images/trash.png'; // Import delete icon image
import "./css/Dashboard.css";
import { toast } from "react-toastify";

// Dashboard component for admin interface with announcements, management panels, and feedback/permissions
const Dashboard = () => {
  // Hook for navigation (for future use, e.g., management panel actions)
  const navigate = useNavigate();
  const username = getLoggedInUser(); // Get logged-in username
  const location = useLocation();
  const API_URL = process.env.REACT_APP_API_URL;
  // const per = location.state?.per || []; // Extract permissions
  const [per, setPer] = useState([]);

  const [feedbacks, setFeedbacks] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [expiredQuizzes, setExpiredQuizzes] = useState(0);
  const [liveQuizzes, setLiveQuizzes] = useState(0);
  const [regInstitutes, setRegInstitutes] = useState(0);
  const [thirdCardValue, setThirdCardValue] = useState(0);
  const [thirdCardTitle, setThirdCardTitle] = useState("");
  const [instituteType, setInstituteType] = useState("");
  const [deleteFeedbackId, setDeleteFeedbackId] = useState(null);
  const [achievementCount, setAchievementCount] = useState({
    totalAchievements: 0,
    unseenAchievements: 0,
  });
  const { user } = useContext(UserContext);
  const [statistics, setStatistics] = useState({});

  const [activeModal, setActiveModal] = useState(null);

  const [standards, setStandards] = useState([]);
  const [newStandard, setNewStandard] = useState("");

  const standardTitle =
    instituteType === "School"
      ? "Standard"
      : instituteType === "College"
        ? "Course"
        : instituteType === "University"
          ? "Course"
          : instituteType === "Coaching"
            ? "Exam"
            : "Standard";

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get(`${API_URL}/feedbacks/feedback`);
        setFeedbacks(res.data.feedbacks);
        console.log("Feedbacks:", res.data.feedbacks);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFeedbacks();
  }, []);

  useEffect(() => {
    if (!user) return;

    console.log("User", user);

    axios
      .get(`${API_URL}/test/achievements/count/${user.id}`)
      .then((res) => {
        setAchievementCount({
          totalAchievements: res.data.totalAchievements,
          unseenAchievements: res.data.unseenAchievements,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }, [user]);

  useEffect(() => {
    if (user?.role_id === 3) {
      axios
        .get(`${API_URL}/institute/standards/${user.institute_id}`)
        .then((res) => {
          setStandards(res.data);
        })
        .catch((err) => {
          console.error("Error fetching standards:", err);
        });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    axios
      .get(`${API_URL}/test/statistics/${user.id}`)
      .then((res) => {
        setStatistics(res.data.statistics);
      })
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const isTeacher = user.role_id === 3;

    // Card 1
    const activeUserUrl = isTeacher
      ? `${API_URL}/user/total-student-count/${user.institute_id}`
      : `${API_URL}/user/active-user-count`;

    axios
      .get(activeUserUrl)
      .then((res) => {
        setActiveUsers(
          isTeacher ? res.data.totalStudents : res.data.totalActiveUsers,
        );
      })
      .catch(console.error);

    if (isTeacher) {
      // Single API for Teacher Dashboard
      axios
        .get(`${API_URL}/test/teacher-dashboard-stats/${user.institute_id}`)
        .then((res) => {
          console.log("Teacher Dashboard Response:", res.data);
          setExpiredQuizzes(res.data.expiredQuizzes);
          setLiveQuizzes(res.data.liveQuizzes);

          setThirdCardTitle("Total Quizzes");
          setThirdCardValue(res.data.totalQuizzes);
        })
        .catch(console.error);
    } else {
      // Admin / Super Admin

      axios
        .get(`${API_URL}/test/expired-test-count`)
        .then((res) => setExpiredQuizzes(res.data.totalExpiredTests))
        .catch(console.error);

      axios
        .get(`${API_URL}/test/live-test-count`)
        .then((res) => setLiveQuizzes(res.data.totalLiveTests))
        .catch(console.error);

      axios
        .get(`${API_URL}/institute/reg-institutions-count`)
        .then((res) => {
          setThirdCardTitle("Registered Institutions");
          setRegInstitutes(res.data.totalRegisteredInstitutes);
        })
        .catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const isTeacher = user.role_id === 3;

    if (isTeacher) {
      // Single API for Teacher Dashboard
      axios
        .get(`${API_URL}/institute/institute_type/${user.institute_id}`)
        .then((res) => {
          setInstituteType(res.data.instituteType);
        })
        .catch(console.error);
    }
  }, [user]);

  const fetchStandards = () => {
    if (user?.role_id !== 3) return;

    axios
      .get(`${API_URL}/institute/standards/${user.institute_id}`)
      .then((res) => {
        setStandards(res.data);
      })
      .catch((err) => {
        console.error("Error fetching standards:", err);
      });
  };

  const handleAddStandard = async () => {
    try {
      if (user.role_id === 3) {
        await axios.post(`${API_URL}/institute/add-standard`, {
          institute_id: user.institute_id,
          item_name: newStandard,
          creator_name: user.name,
          creator_id: user.user_id,
        });

        fetchStandards();
      } else if (user.role_id === 4) {
        await axios.post(`${API_URL}/user/add-standard`, {
          student_id: user.user_id,
          standard_type: newStandard,
        });
      }

      setNewStandard("");
      setActiveModal("manage");
      fetchStandards();
    } catch (error) {
      console.error("Error adding standard:", error);
    }
  };

  const openManageStandards = () => {
    fetchStandards();
    setActiveModal("manage");
  };

  // Open Manage Standards when direct route is opened
  useEffect(() => {
    if (location.pathname === "/dashboard/managestandards") {
      setActiveModal("manage");

      if (user?.role_id === 3) {
        axios
          .get(`${API_URL}/institute/standards/${user.institute_id}`)
          .then((res) => {
            setStandards(res.data);
          })
          .catch((err) => {
            console.error("Error fetching standards:", err);
          });
      }
    }
  }, [location.pathname, user]);

  const closeManageStandards = () => {
    setActiveModal(null);

    if (location.pathname === "/dashboard/managestandards") {
      navigate("/dashboard", { replace: true });
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this standard?")) return;

    axios.delete(`${API_URL}/institute/delete-standard/${id}`).then(() => {
      fetchStandards();
    });
  };

  //

  const handleDeleteFeedback = async (id) => {
    try {
      await axios.delete(`${API_URL}/feedbacks/feedback/${id}`);

      setFeedbacks((prev) => prev.filter((feedback) => feedback.id !== id));

      toast.success("Feedback deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete feedback");
    }
  };

  // Placeholder data for permissions should be same as in DB
  const [permissions, setPermissions] = useState([
    {
      id: 1,
      title: "Create Admin",
      description:
        "Allows the user to create new admin accounts and assign roles.",
      enabled: false,
    },
    {
      id: 2,
      title: "Add Institution",
      description: "Allows the user to add new institutions to the platform.",
      enabled: false,
    },
    {
      id: 3,
      title: "Deletion Priviledge",
      description:
        "Allows the user to delete existing admin accounts and revoke access.",
      enabled: false,
    },
    {
      id: 4,
      title: "Teacher Approval",
      description:
        "Allows the user to approve or reject teacher registration requests.",
      enabled: false,
    },
  ]);

  useEffect(() => {
    const permissionsFromState = location.state?.per;
    if (permissionsFromState && permissionsFromState.length) {
      setPer(permissionsFromState);
    } else {
      // Try to load from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setPer(parsedUser.permissions || parsedUser.per || []);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (!username) {
      navigate("/login");
      return;
    }

    console.log("Username.user.role_id", username.user);
  }, [username, navigate]);
  const role = username?.user?.role_id;

  useEffect(() => {
    console.log("Role", role);

    if (role === 1) {
      fetchAdminPermissions(); // Super Admin
    }
  }, [role]);

  if (!username) return null;

  // Placeholder data for announcements
  const announcements = [
    // { id: 1, title: 'New Quiz Added', content: 'A new science quiz has been added to the platform.', date: '2025-07-15' },
    // { id: 2, title: 'System Maintenance', content: 'Scheduled maintenance on July 20, 2025, from 2 AM to 4 AM.', date: '2025-07-14' },
    // { id: 3, title: 'User Feedback Update', content: 'New feedback form features deployed.', date: '2025-07-13' },
    /*{ id: 4, title: 'New Feature Release', content: 'We have released a new feature for tracking user progress.', date: '2025-07-12' },
    { id: 5, title: 'Upcoming Webinar', content: 'Join our webinar on educational technology on July 25, 2025.', date: '2025-07-11' },*/
    //just to check that the scroll works
  ];
  //Menu items for teacher and user dashboards.... LEFT SECTION
  const menuItemsByRole = {
    1: [
      // Super Admin
      {
        id: 1,
        title: "Manage Users",
        pagename: "manageuser",
        icon: "group.png",
      },
      { id: 2, title: "Manage Quiz", pagename: "managequiz", icon: "quiz.png" },
      { id: 3, title: "Create Quiz", pagename: "createquiz", icon: "quiz.png" },
      {
        id: 4,
        title: "Manage Institutions",
        pagename: "manageinstitutes",
        icon: "school.png",
      },
    ],
    2: [
      // Admin
      {
        id: 1,
        title: "Manage Users",
        pagename: "manageuser",
        icon: "group.png",
      },
      {
        id: 2,
        title: "Manage Quiz",
        pagename: "managetests",
        icon: "quiz.png",
      },
      { id: 3, title: "Create Quiz", pagename: "createquiz", icon: "quiz.png" },
    ],
    3: [
      //Teacher
      // { id: 1, title: 'Dashboard', pagename: 'dashboard', icon: 'home.png' },
      {
        id: 1,
        title: "Create Quiz",
        pagename: "registeredstudents",
        icon: "group.png",
      },
      {
        id: 2,
        title: "Manage Quizzes",
        pagename: "registeredquizzes",
        icon: "quiz.png",
      },
      {
        id: 3,
        title: "Winner List",
        pagename: "winnerlist",
        icon: "planning.png",
      },
      {
        id: 4,
        title: "Manage" + standardTitle,
        pagename: "managestandards",
        icon: "pending.png",
      },
      {
        id: 5,
        title: "Contact to Admin",
        pagename: "managestandards",
        icon: "contact-admin.png",
      },
    ],
    4: [
      //Student
      // { id: 1, title: 'Dashboard', pagename: 'dashboard', icon: 'home.png' },
      { id: 1, title: "Take Quizz", pagename: "takequiz", icon: "quiz.png" },
      {
        id: 2,
        title: "My Quizzes",
        pagename: "past-quizzes",
        icon: "planning.png",
      },
      {
        id: 3,
        title: "Achievements",
        pagename: "achievements",
        icon: "achievement.png",
      },
      {
        id: 4,
        title: "Detailed Performance",
        pagename: "performance",
        icon: "good-feedback.png",
      },
      {
        id: 5,
        title: "Payment Details",
        pagename: "payment-details",
        icon: "rupee.png",
      },
      ...(user?.institute_id &&
      (user?.standard_type == null || user?.standard_type === "")
        ? [
            {
              id: 6,
              title: `Add/Update ${standardTitle}`,
              pagename: "addstandard",
              icon: "online-course.png",
            },
          ]
        : []),
      {
        id: 7,
        title: "Contact to Admin",
        pagename: "managestandards",
        icon: "contact-admin.png",
      },
    ],
    5: [
      //Normal User(Guest)
      // { id: 1, title: 'Dashboard', pagename: 'dashboard', icon: 'home.png' },
      { id: 1, title: "Take Quizz", pagename: "takequiz", icon: "quiz.png" },
      {
        id: 2,
        title: "My Quizzes",
        pagename: "past-quizzes",
        icon: "planning.png",
      },
      {
        id: 3,
        title: "Achievements",
        pagename: "achievements",
        icon: "achievement.png",
      },
      {
        id: 4,
        title: "Detailed Performance",
        pagename: "performance",
        icon: "good-feedback.png",
      },
      {
        id: 5,
        title: "Payment Details",
        pagename: "payment-details",
        icon: "rupee.png",
      },
      {
        id: 6,
        title: "Contact to Admin",
        pagename: "managestandards",
        icon: "contact-admin.png",
      },
    ],
  };
  // Placeholder data for feedback

  // const feedbacks = [
  //   { id: 1, name: 'John Doe', email: 'john@example.com', message: 'Great platform, but needs more quizzes.', date: '2025-07-14' },
  //   { id: 2, name: 'Jane Smith', email: 'jane@example.com', message: 'Loved the science literacy program!', date: '2025-07-13' },

  //   { id: 3, name: 'Alex Brown', email: 'alex@example.com', message: 'Please add more interactive features.', date: '2025-07-12' },

  // ];
  //RIGHT Bottom section for User and Students...
  const leadershipboard = [
    {
      id: 1,
      name: "TOP 3 From Weekly General Test",
      first: "Ava",
      score_first: 95,
      second: "Liam",
      score_second: 94,
      third: "Sophia",
      score_third: 93,
      date: "09-03-2026",
    },
    {
      id: 2,
      name: "Ranking of Hindi Test",
      first: "Devi",
      score_first: 92,
      second: "Rahul",
      score_second: 90,
      third: "Priya",
      score_third: 88,
      date: "09-03-2026",
    },
  ];
  // Function to toggle permission status
  const togglePermission = async (permission_title, id) => {
    try {
      // Find current permission
      const permission = permissions.find((p) => p.id === id);

      // Toggle value
      const updatedStatus = !permission.enabled;

      // 🔥 Call backend API
      await axios.post(`${API_URL}/user/admin-permission`, {
        permissionName: permission_title,
        enabled: updatedStatus,
      });

      // ✅ Update UI only after success
      setPermissions((prevPermissions) =>
        prevPermissions.map((perm) =>
          perm.id === id ? { ...perm, enabled: updatedStatus } : perm,
        ),
      );
    } catch (error) {
      console.error("Error updating permission:", error);
    }
  };
  // Placeholder data for management panels (color removed, handled in CSS)
  const managementPanels = {
    1: [
      //For Super-Admin
      {
        id: 1,
        title: "Manage Users",
        description: "For Managing Users",
        pagename: "manageuser",
        icon: "group.png",
      },
      {
        id: 2,
        title: "Manage Quiz",
        description: "For Quiz Management",
        pagename: "managequiz",
        icon: "quiz.png",
      },
      {
        id: 4,
        title: "Create Quiz",
        description: "For Quiz Creation",
        pagename: "createquiz",
        icon: "quiz.png",
      },
      {
        id: 5,
        title: "Manage Institutions",
        description: "For Institute Management",
        pagename: "manageinstitutes",
        icon: "school.png",
      },
      // { id: 7, title: "Add Institutions", description: "For Adding Institutions", pagename: "addinstitutions", icon: "school.png" },
      {
        id: 11,
        title: "Winner List",
        description: "For viewing Winners",
        pagename: "winnerlist",
        icon: "achievement.png",
      },
      {
        id: 10,
        title: "Payment Gateway",
        description: "For managing payments",
        pagename: "payment-gateway",
        icon: "payment-service.png",
      },
    ],

    2: [
      //For Admin
      {
        id: 1,
        title: "Manage Users",
        description: "For Managing Users",
        pagename: "manageuser",
        icon: "group.png",
      },
      {
        id: 2,
        title: "Manage Quiz",
        description: "For Quiz Management",
        pagename: "managequiz",
        icon: "quiz.png",
      },
      {
        id: 4,
        title: "Create Quiz",
        description: "For Quiz Creation",
        pagename: "createquiz",
        icon: "quiz.png",
      },
      {
        id: 5,
        title: "Manage Institutions",
        description: "For Institute Management",
        pagename: "manageinstitutes",
        icon: "school.png",
      },
      {
        id: 11,
        title: "Winner List",
        description: "For viewing Winners",
        pagename: "winnerlist",
        icon: "achievement.png",
      },
    ],
    3: [
      //For Teacher
      {
        id: 12,
        title: "Manage Students",
        description: "For Managing Students",
        pagename: "managestudents",
        icon: "group.png",
      },
      {
        id: 4,
        title: "Create Quiz",
        description: "For Quiz Creation",
        pagename: "createquiz",
        icon: "quiz.png",
      },
      {
        id: 2,
        title: "Manage Quiz",
        description: "For Managing Quizzes",
        pagename: "managequiz",
        icon: "planning.png",
      },
      {
        id: 11,
        title: "Winner List",
        description: "For viewing Winners",
        pagename: "winnerlist",
        icon: "school.png",
      },
    ],
    4: [
      {
        id: 3,
        title: "Take Quiz",
        description: "For giving quizzes",
        pagename: "takequiz",
        icon: "answer.png",
      },
      {
        id: 5,
        title: "Past Quizzes",
        description: "For Viewing Past Quizzes",
        pagename: "past-quizzes",
        icon: "report.png",
      },
      // { id: 6, title: "Tile 6", description: "This is tile 6", pagename: "desc" },
    ],
    5: [
      {
        id: 3,
        title: "Take Quiz",
        description: "For giving quizzes",
        pagename: "takequiz",
        icon: "answer.png",
      },
      {
        id: 5,
        title: "Past Quizzes",
        description: "For Viewing Past Quizzes",
        pagename: "past-quizzes",
        icon: "report.png",
      },
      // { id: 6, title: "Tile 6", description: "This is tile 6", pagename: "desc" },
    ],
  };

  //Performance Metrics for student and normal user...
  // const performanceMetrics = [
  //   { id: 1, title: 'Quizzes Taken', value: 4, icon: 'quiz.png' },
  //   { id: 2, title: 'Average Score', value: '88%', icon: 'good-feedback.png' },
  //   { id: 3, title: 'Avg Time', value: '3 min', icon: 'chronometer.png' },
  //   { id: 4, title: 'Achievements', value: 2, icon: 'fire.png' }
  // ];

  const performanceMetrics = [
    {
      id: 1,
      title: "Quizzes Taken",
      value: statistics?.quizzes_taken ?? 0,
      icon: "quiz.png",
    },
    {
      id: 2,
      title: "Average Score",
      value: `${statistics?.average_score ?? 0}%`,
      icon: "good-feedback.png",
    },
    {
      id: 3,
      title: "Average Time / Quiz",
      value: statistics?.average_time ?? "0 sec",
      icon: "chronometer.png",
    },
    {
      id: 4,
      title: "Achievements",
      value: achievementCount.totalAchievements,
      icon: "badge.png",
    },
  ];
  // Handle button clicks for management panels (placeholder for navigation)
  const handleActionClick = (title) => {
    console.log(`${title} clicked!`);
    // Future: Add navigation, e.g., navigate('/manage-users')
  };

  const fetchAdminPermissions = async () => {
    try {
      const res = await axios.get(`${API_URL}/user/get-admin-permission`);

      const adminPermissions = res.data; // array from backend

      // Create a set for fast lookup
      const permissionSet = new Set(
        adminPermissions.map((p) => p.permission_name),
      );

      // Update state properly
      const updatedPermissions = permissions.map((permission) => ({
        ...permission,
        enabled: permissionSet.has(permission.title),
      }));

      setPermissions(updatedPermissions);

      console.log("Admin permission", res.data);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const menuItems = menuItemsByRole[role] || []; // Get menu items based on role, default to empty array if role not found

  const rolePanels = managementPanels[role] || []; // Get management panels based on role, default to empty array if role not found

  console.log("per:", per);
  console.log("rolePanels:", rolePanels);
  return (
    <main role="main" className="dashboard-main">
      {/* Main content container with three-column layout */}
      <div className="dashboard-content">
        {/* Left Section: Announcements */}

        <section
          className="announcements-section"
          aria-labelledby="announcements-heading"
        >
          <div className="menu-box">
            <div className="menu-box-header">
              <h2 id="announcements-heading">Menu</h2>
              <span className="menu-box-arrow">→</span>
            </div>

            <div className="menu-scroll menu-container">
              {menuItems.map((item) =>
                item.pagename === "managestandards" ||
                item.pagename === "addstandard" ? (
                  <div
                    key={item.id}
                    className="menu-item"
                    onClick={() => {
                      if (item.pagename === "managestandards") {
                        openManageStandards();
                      } else if (item.pagename === "addstandard") {
                        setActiveModal("add");
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={`/images/${item.icon}`}
                      className="mgt-icon"
                      alt={item.title}
                    />

                    <div className="menu-item-text">
                      <h4>{item.title}</h4>
                      {item.total && <p>{item.total}</p>}
                    </div>

                    <span className="menu-arrow">→</span>
                  </div>
                ) : (
                  <Link
                    to={`/dashboard/${item.pagename}`}
                    key={item.id}
                    className={`menu-item ${
                      item.pagename === "achievements" &&
                      achievementCount.unseenAchievements > 0
                        ? "achievement-highlight"
                        : ""
                    }`}
                  >
                    <img
                      src={`/images/${item.icon}`}
                      className="mgt-icon"
                      alt={item.title}
                    />

                    <div className="menu-item-text">
                      <h4>{item.title}</h4>
                      {item.total && <p>{item.total}</p>}
                    </div>

                    {item.pagename === "achievements" &&
                      achievementCount.unseenAchievements > 0 && (
                        <span className="achievement-badge">
                          {achievementCount.unseenAchievements}
                        </span>
                      )}

                    <span className="menu-arrow">→</span>
                  </Link>
                ),
              )}
            </div>
          </div>

          {(role === 1 || role === 2) && (
            <div className="feedback-box">
              <div className="announce-head-icon">
                <h2 id="announcements-heading">User Feedback</h2>
                <span
                  className="feedback-icon"
                  title="User Feedback"
                  onClick={() => console.log("Refresh feedback")}
                >
                  <img src={"/images/feedback-icon.png"} alt="Feedback" />
                </span>
              </div>

              <div className="announce-scroll">
                {!feedbacks || feedbacks.length === 0 ? (
                  <div className="no-feedback-container">
                    <img
                      src={"/images/message.jpeg"}
                      alt="No Feedback"
                      className="no-feedback-image"
                    />
                    <p>No feedback available.</p>
                  </div>
                ) : (
                  feedbacks.map((feedback) => (
                    <article key={feedback.id} className="announcement-card">
                      <div className="name-Del-icon">
                        <h3>{feedback.name}</h3>
                        {per.includes(8) && (
                          <span
                            className="delete-icon"
                            title="Delete Feedback"
                            onClick={() => setDeleteFeedbackId(feedback.id)}
                          >
                            <img src={"/images/trash.png"} alt="Delete" />
                          </span>
                        )}
                      </div>
                      <p>
                        <strong>Email:</strong> {feedback.email}
                      </p>
                      <p>{feedback.message}</p>
                      <span className="announcement-date">{feedback.date}</span>
                    </article>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/* Middle Section: Welcome Admin + Management Panels */}
        <section className="middle-section">
          {/* Welcome Admin Container */}
          <div className="welcome-container">
            <div className="welcome-text">
              {username && username.user && (
                <h1>Welcome {username.user.username}</h1>
              )}
              {/* <h1>Welcome </h1> */}
              <p className="cheerful-line">
                Hope you're having a fantastic day of impact and innovation! 🚀
              </p>
            </div>
            <div className="admin-avatar">
              {username &&
                username.user &&
                (username.user.role_id === 1 ||
                  username.user.role_id === 2) && (
                  <img src={"/images/admin.png"} alt="Profile" />
                )}

              {username && username.user && username.user.role_id === 3 && (
                <img src={"/images/teacher.png"} alt="Profile" />
              )}

              {username && username.user && username.user.role_id === 4 && (
                <img src={"/images/student.png"} alt="Profile" />
              )}

              {username && username.user && username.user.role_id === 5 && (
                <img src={"/images/guest.png"} alt="Profile" />
              )}
            </div>
          </div>
          {/* Management Panels */}
          {/* This mini-mgt grid is for adding the mini permissions or features in the admin dashboard for now these are static and hard coded.. but in future i am planning to make it dynamic just like the other management containers...**/}
          {role === 1 && (
            <div className="mini-mgt-grid">
              <div className="mini-mgt">
                <img
                  src={"/images/group.png"}
                  alt="Total Users"
                  className="total-mgt-icon"
                />
                <h2>Total Users</h2>
                <p>{activeUsers} </p>
              </div>
              <div className="mini-mgt">
                <img
                  src={"/images/quiz.png"}
                  alt="Expired quizzes"
                  className="total-mgt-icon"
                />
                <h2>Expired Quizzes</h2>
                <p>{expiredQuizzes} </p>
              </div>
              <div className="mini-mgt">
                <img
                  src={"/images/school.png"}
                  alt="Total Institutions"
                  className="total-mgt-icon"
                />
                <h2>Registered Institutions</h2>
                <p>{regInstitutes} </p>
              </div>
              <div className="mini-mgt">
                <img
                  src={"/images/planning.png"}
                  alt="Active Quizzes"
                  className="total-mgt-icon"
                />
                <h2>Live Quizzes</h2>
                <p>{liveQuizzes} </p>
              </div>
            </div>
          )}

          {role === 3 && (
            <div className="mini-mgt-grid">
              <div className="mini-mgt">
                <img
                  src={"/images/group.png"}
                  alt="Total Students"
                  className="total-mgt-icon"
                />
                <h2>Total Students</h2>
                <p>{activeUsers} </p>
              </div>
              <div className="mini-mgt">
                <img
                  src={"/images/quiz.png"}
                  alt="Expired quizzes"
                  className="total-mgt-icon"
                />
                <h2>Expired Quizzes</h2>
                <p>{expiredQuizzes} </p>
              </div>
              <div className="mini-mgt">
                <img
                  src={"/images/school.png"}
                  alt="Total Institutions"
                  className="total-mgt-icon"
                />
                <h2>Total Quizzes</h2>
                <p>{thirdCardValue} </p>
              </div>
              <div className="mini-mgt">
                <img
                  src={"/images/planning.png"}
                  alt="Active Quizzes"
                  className="total-mgt-icon"
                />
                <h2>Live Quizzes</h2>
                <p>{liveQuizzes} </p>
              </div>
            </div>
          )}

          {(role === 4 || role === 5) && (
            <div className="performance-section">
              <div className="announce-head-icon">
                <h2 id="announcements-heading">Performance Metrics</h2>
              </div>
              <div className="performance-grid">
                {performanceMetrics.map((metric) => (
                  <div className="performance-card" key={metric.id}>
                    <img
                      src={`/images/${metric.icon}`}
                      alt={metric.title}
                      className="performance-icon"
                    />
                    <h3>{metric.title}</h3>
                    <p>{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="management-grid">
            {rolePanels
              .filter((panel) => per.includes(panel.id))
              .map((panel, index) => (
                <Link
                  to={`/dashboard/${panel.pagename}`}
                  key={panel.id}
                  className={`management-card management-card-${index + 1}`}
                >
                  <img
                    src={`/images/${panel.icon}`}
                    alt={panel.title}
                    className="mgt-icon"
                  />
                  <h2>{panel.title}</h2>
                  <p>{panel.description}</p>
                </Link>
              ))}

            {/* <div className='management-card management-card-7'>
              <img src={'/images/school.png'} alt="Institutions" className='mgt-icon'/>
              <h2>Add Institutions</h2>
              <p>For Adding Institutions</p>
            </div>
            <div className='management-card management-card-8'>
              <img src={'/images/achievement.png'} alt="Winners" className='mgt-icon'/>
              <h2>Winner List</h2>
              <p>For viewing Winners</p>
            </div>
            <div className='management-card management-card-9'>
              <img src={'/images/payment-service.png'} alt="Payment Gateway" className='mgt-icon'/>
              <h2>Payment Gateway</h2>
              <p>For managing payments</p>
            </div> */}

            {/***hard code for id 7,8,9 
          {per.includes(7) && (
            <Link to={`/addinstitutions`} className={`management-card management-card-7`}>
              <h2>Add Institutions</h2>
              <p>For Adding Institutions</p>
            </Link>
          )}
          
          {per.includes(9) && (
            <Link to= {`/paymentgateway`} className={`management-card management-card-9`}>
              <h2>Payment Gateway</h2>
              <p>For managing payments</p>
            </Link>
          )}**/}
          </div>

          {/* <div className="management-grid">
            {managementPanels.map((panel, index) => (
              <article
                key={panel.id}
                className={`management-card management-card-${index + 1}`}
                onClick={() => handleActionClick(panel.title)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleActionClick(panel.title);
                   }
                }}>
            <h3>{panel.title}</h3>
            <p>{panel.description}</p>
            </article>

            ))}
          </div> */}
        </section>

        {/* Right Section: announcement & Technical permissions */}
        <section
          className="feedback-permissions-section"
          aria-labelledby="feedback-permissions-heading"
        >
          <div className="feedback-permissions-container">
            {/* Feedback Subsection */}
            <div className="feedback-section-d">
              {/** for section headings */}
              <div className="announce-head-icon">
                <h3>Announcements</h3>
                <span
                  className="announce-icon"
                  title=" Announcements"
                  onClick={() => console.log("Refresh announcements")}
                >
                  <img src={"/images/11182227.png"} alt="Announcements" />
                </span>
              </div>
            </div>
            <div className="announcements-list">
              <div className="feedback-scroll">
                {/**Its required so that the scrolling could be done smoothly */}
                {!announcements || announcements.length === 0 ? (
                  <div className="no-announcement-container">
                    <img
                      src={"/images/message.jpeg"}
                      alt="No Announcements"
                      className="no-announcement-image"
                    />
                    <p>No announcements available.</p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <article key={announcement.id} className="feedback-card">
                      <h4>{announcement.title}</h4>
                      <p>{announcement.content}</p>
                      <span className="announcement-date">
                        {announcement.date}
                      </span>
                    </article>
                  ))
                )}
              </div>
            </div>
            <hr></hr>
            {/* permissions Subsection */}
            {/**role_id===1 : super admin and role_id!== 1 admin*/}
            {role === 1 && (
              <div className="permissions-section">
                <div className="announce-head-icon">
                  <h3>Manage Admin Permissions</h3>
                  <span className="permissions-icon" title="Manage Permissions">
                    <img src={"/images/permission.png"} alt="Permissions" />
                  </span>
                </div>
                <div className="feedback-scroll">
                  {permissions.map((permissions) => (
                    <article className="permission-card">
                      <div className="toggle-head">
                        <h4>{permissions.title}</h4>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={permissions.enabled}
                            onChange={() =>
                              togglePermission(
                                permissions.title,
                                permissions.id,
                              )
                            }
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                      <p>{permissions.description}</p>
                    </article>
                  ))}
                  {/* {permissions.map((permission) => (
               //permission -> issue 
                  <article key={permission.id} className="permission-card">
                   <h4>{permission.title}</h4>
                   <p>{permission.description}</p>
                   <p><strong>Status:</strong> {permission.status}</p>
                   <span className="permission-date">{permission.date}</span>
                  </article>
                ))}*/}
                </div>
              </div>
            )}
          </div>
        </section>
        {activeModal === "manage" &&
          createPortal(
            <div className="modal-overlay">
              <div className="manage-modal">
                <div className="modal-header">
                  <h3>Manage {standardTitle}</h3>

                  <button
                    type="button"
                    className="close-btn"
                    onClick={closeManageStandards}
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-body">
                  <div className="standard-table-wrapper">
                    <table className="standard-table">
                      <thead>
                        <tr>
                          <th>S.No.</th>
                          <th>{standardTitle} Id</th>
                          <th>{standardTitle}</th>
                          <th>Creator Name</th>
                          <th>Delete</th>
                        </tr>
                      </thead>

                      <tbody>
                        {standards.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="no-data">
                              No {standardTitle.toLowerCase()} found.
                            </td>
                          </tr>
                        ) : (
                          standards.map((item, index) => (
                            <tr key={item.standard_id}>
                              <td>{index + 1}</td>
                              <td>{item.standard_id}</td>
                              <td>{item.item_name}</td>
                              <td>{item.creator_name}</td>
                              <td>
                                <button
                                  className="delete-btn"
                                  onClick={() => handleDelete(item.standard_id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setActiveModal("add");
                    }}
                  >
                    Add New Standard
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
        {activeModal === "add" && (
          <div className="modal-overlay">
            <div className="add-modal">
              <div className="modal-header">
                <button
                  className="close-btn"
                  onClick={() => {
                    setNewStandard("");
                    fetchStandards();
                    setActiveModal("manage");
                  }}
                >
                  ✕
                </button>
              </div>

              {user.role_id === 4 && (
                <div
                  style={{
                    color: "red",
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "12px",
                  }}
                >
                  You can add standard for first time only, so add carefully.
                </div>
              )}

              <input
                type="text"
                placeholder={`Enter Your ${standardTitle} Name`}
                value={newStandard}
                onChange={(e) => {
                  // if (user.role_id === 3) {
                  setNewStandard(e.target.value);
                  // }
                }}
              />

              <button className="btn btn-success" onClick={handleAddStandard}>
                Add
              </button>
            </div>
          </div>
        )}

        {deleteFeedbackId && (
          <div className="modal-overlay">
            <div className="delete-confirm-dialog">
              <div className="delete-dialog-icon">🗑️</div>

              <h3>Delete Feedback?</h3>

              <p>
                Are you sure you want to delete this feedback?
                <br />
                This action cannot be undone.
              </p>

              <div className="delete-dialog-actions">
                <button
                  className="delete-cancel-btn"
                  onClick={() => setDeleteFeedbackId(null)}
                >
                  Cancel
                </button>

                <button
                  className="delete-confirm-btn"
                  onClick={async () => {
                    await handleDeleteFeedback(deleteFeedbackId);
                    setDeleteFeedbackId(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
