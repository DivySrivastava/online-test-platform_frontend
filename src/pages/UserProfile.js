import { FaSave, FaTimesCircle } from "react-icons/fa";
import { useState, useContext, useEffect } from "react";
import "./css/UserProfile.css";
import { useAxios } from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

const getAcademicLabel = (institutionType) => {
  switch (institutionType) {
    case "School":
      return "Standard";
    case "Coaching":
      return "Exam";
    case "College":
    case "University":
      return "Course";
    default:
      return "Standard/Course/Exam";
  }
};

function UserProfile() {

  const { user, loading, logoutUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [originalData, setOriginalData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [instituteData, setInstituteData] = useState(null);
  const axios = useAxios();
  const [addrVal, setAddrVal] = useState("");
  const [cityVal, setCityVal] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [typeVal, setTypeVal] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  const [userInterests, setUserInterests] = useState([]);

  useEffect(() => {
    if (!user) return;

    console.log("User in Profile", user);

    setUserData(user);
    setOriginalData(user);
  }, [user]);

  useEffect(() => {
    console.log("Profile received user:", user);
  }, [user]);

  useEffect(() => {
    console.log("userData:", userData);
  }, [userData]);

  useEffect(() => {
    const getInstitute = async () => {
      if (!user?.institute_id) return;

      try {
        const res = await axios.get(
          `${API_URL}/institute/institutions/${user.institute_id}`,
          {
            params: {
              state: stateVal || null,
              city: cityVal || null,
              institute_type: typeVal || null,
            },
          }
        );

        setInstituteData(res.data);
        console.log("results-->", res.data);
      } catch (err) {
        console.error(err);
      }
    };

    getInstitute();
  }, [userData, stateVal, cityVal, typeVal]);

  useEffect(() => {

    //console.log("Effect fired", userData);

    if (userData?.id) {
      fetchUserInterests();
    }
  }, [userData]);

  //   useEffect(() => {
  //   if (user?.user_id) {
  //     fetchUserInterests();
  //   }
  // }, [user]);


  const [unlockedFields, setUnlockedFields] = useState({
    name: false,
    gender: false,
    mobile: false,
    email: false,
    fatherName: false,
    designation: false,
  });

  // Toast notification state (replaces the plain alert() on Save)
  const [toast, setToast] = useState({ visible: false, message: "" });

  const showToast = (message) => {
    setToast({ visible: true, message });
    // auto-hide after 3 seconds
    setTimeout(() => {
      setToast({ visible: false, message: "" });
    }, 3000);
  };

  // Save/Cancel are only enabled once something has actually changed
  // const isEdited = JSON.stringify(user) !== JSON.stringify(originalData);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePencilClick = (fieldName) => {
    setUnlockedFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  };

  const lockAllFields = () => {
    setUnlockedFields({
      name: false,
      gender: false,
      mobile: false,
      email: false,
      fatherName: false,
      designation: false,
    });
  };

  const handleSave = () => {
    // if (!isEdited) return;
    // setOriginalData(userData);
    // lockAllFields();
    // console.log(userData);
    // showToast("Profile Saved Successfully ✅");
  };

  const handleCancel = () => {
    // if (!isEdited) return;
    // setUserData(originalData);
    // lockAllFields();
  };

  const role = user?.role_name;
  const isTeacher = role === "Teacher";
  const isStudent = role === "Student";
  const showInstitutionalCard = isTeacher || isStudent;
  const isInterestVisible = isStudent || (role === "Others");

  const roleTitle =
    role === "Super Admin"
      ? "Super Admin"
      : role === "Admin"
        ? "Admin"
        : role === "Teacher"
          ? "Teacher"
          : role === "Student"
            ? "Student"
            : "User";

  const handleDeleteAccount = async () => {
    try {
      const res = await axios.delete(
        `${API_URL}/auth/delete/${user.id}`
      );

      localStorage.removeItem("user");
      setUserData(null);

      // Logout user
      logoutUser();

      navigate("/");

    } catch (err) {
      console.error(err);
      alert("Failed to delete account.");
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!userData) {
    return <div>Loading profile...</div>;
  }

  const fetchUserInterests = async () => {

    // console.log("In fetchUserInterests", user.user_id)


    try {
      const res = await axios.get(
        `${API_URL}/user/interests/${userData.id}`
      );

      if (res.data.success) {

        // console.log("User Interests", res.data.data);

        setUserInterests(res.data.data);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
        "Unable to fetch interests."
      );
    }
  };



  const formatInterests = (interests) => {
    if (!interests || interests.length === 0) return "";

    const names = interests.map((item) => item.interest_name);

    if (names.length === 1) return names[0];

    if (names.length === 2) return `${names[0]} and ${names[1]}`;

    return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  };

  return (
    <div className="container">
      {/* Header Section */}
      <div className="header">
        <h1 className="title">{roleTitle}</h1>
        <div className="line"></div>
      </div>

      {/* Personal Details Card - common to every role */}
      <div className="desktop-main-row">
        <div className="card personal-card">
          <h2 className="card-title">Personal Details</h2>

          <div className="field">
            <label className="label">User ID :</label>
            <div className="input-box">
              <input
                type="text"
                value={user?.id || "--"}
                className="input"
                readOnly
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Username :</label>
            <div className="input-box">
              <input
                type="text"
                value={user?.username || "--"}
                className="input"
                readOnly
              />
            </div>
          </div>

          {/* Editable */}
          <div className="field">
            <label className="label">Name :</label>
            <div className="input-box">
              <input
                type="text"
                name="name"
                value={user?.name || "--"}
                onChange={handleChange}
                className="input"
                placeholder="Enter Name"
                readOnly={!unlockedFields.name}
              />
              {/* <span
                className="edit-icon"
                onClick={() => handlePencilClick("name")}
                style={{ cursor: "pointer" }}
              >
                ✏️
              </span> */}
            </div>
          </div>

          {/* Editable */}
          <div className="field">
            <label className="label">Gender :</label>
            <div className="input-box">
              <input
                type="text"
                name="gender"
                value={userData.user_gender || "--"}
                onChange={handleChange}
                className="input"
                readOnly={!unlockedFields.name}
              />
              {/* <select
                name="gender"
                value={userData.gender || "--"}
                onChange={handleChange}
                className="input"
                disabled={!unlockedFields.gender}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select> */}
              {/*<span
                className="edit-icon"
                onClick={() => handlePencilClick("gender")}
                style={{ cursor: "pointer" }}
              >
                ✏️
              </span>*/}
            </div>
          </div>

          {/* Student only - editable */}
          {isStudent && (
            <div className="field">
              <label className="label">Father's Name :</label>
              <div className="input-box">
                <input
                  type="text"
                  name="fatherName"
                  value={userData.father_name || "--"}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter Father's Name"
                  readOnly={!unlockedFields.fatherName}
                />
                {/* <span
                  className="edit-icon"
                  onClick={() => handlePencilClick("fatherName")}
                  style={{ cursor: "pointer" }}
                >
                  ✏️
                </span> */}
              </div>
            </div>
          )}

          {/* Editable */}
          <div className="field">
            <label className="label">Mobile :</label>
            <div className="input-box">
              <input
                type="tel"
                name="mobile"
                value={user?.user_mobile || "--"}
                onChange={handleChange}
                className="input"
                placeholder="Enter Mobile Number"
                readOnly={!unlockedFields.mobile}
              />
              {/* <span
                className="edit-icon"
                onClick={() => handlePencilClick("mobile")}
                style={{ cursor: "pointer" }}
              >
                ✏️
              </span> */}
            </div>
          </div>

          {/* Editable */}
          <div className="field">
            <label className="label">Email :</label>
            <div className="input-box">
              <input
                type="email"
                name="email"
                value={user?.user_email || "--"}
                onChange={handleChange}
                className="input"
                placeholder="Enter Email Address"
                readOnly={!unlockedFields.email}
              />
              {/* <span
                className="edit-icon"
                onClick={() => handlePencilClick("email")}
                style={{ cursor: "pointer" }}
              >
                ✏️
              </span> */}
            </div>
          </div>

          {isInterestVisible && (<div className="field">
            <label className="label">Interests :</label>
            <div className="input-box">
              <textarea
                type="text"
                name="interests"
                value={formatInterests(userInterests)  || "--"}
                onChange={handleChange}
                className="input"

                readOnly={!unlockedFields.email}
              />
              {/* <span
                className="edit-icon"
                onClick={() => handlePencilClick("email")}
                style={{ cursor: "pointer" }}
              >
                ✏️
              </span> */}
            </div>
          </div>
          )}
          <div className="field">
            <label className="label">Role :</label>
            <div className="input-box">
              <input type="text" value={roleTitle} className="input" readOnly />
            </div>
          </div>

          <div className="field">
            <label className="label">Joining Date :</label>
            <div className="input-box">
              <input
                type="text"
                value={userData.created_at || "--"}
                className="input"
                readOnly
              />
            </div>
          </div>

          {/* Teacher only - editable */}
          {isTeacher && (
            <div className="field">
              <label className="label">Designation :</label>
              <div className="input-box">
                <input
                  type="text"
                  name="designation"
                  value={userData.designation || "--"}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter Designation"
                  readOnly={!unlockedFields.designation}
                />
                {/* <span
                  className="edit-icon"
                  onClick={() => handlePencilClick("designation")}
                  style={{ cursor: "pointer" }}
                >
                  ✏️
                </span> */}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Institutional Details Card - ONLY for Teacher & Student */}
      {showInstitutionalCard && (
        <div className="card institutional-card">
          <h2 className="card-title">Institutional Details</h2>

          <div className="field-column full-width">
            <label className="label">Institution ID :</label>
            <div className="input-box">
              <input
                type="text"
                value={userData.institute_id || "--"}
                className="input"
                readOnly
              />
            </div>
          </div>

          <div className="field-column full-width">
            <label className="label">Institution Name :</label>
            <div className="input-box">
              <input
                type="text"
                value={instituteData?.institute_name || ""}
                className="input"
                readOnly
              />
            </div>
          </div>

          {/* Address gets its own full-width row since addresses can be long */}
          <label className="label">Institution Address :</label>
          <input
            type="text"
            value={[
              instituteData?.institute_city,
              instituteData?.institute_state,
              "India",
            ]
              .filter(Boolean)
              .join(", ")}
            className="input"
            readOnly
          />

          {/* Institution Type paired with the student's academic field (if applicable) */}
          <div className="row">
            <div className="field-column">
              <label className="label">Institution Type :</label>
              <div className="input-box">
                <input
                  type="text"
                  value={instituteData?.institute_type || ""}
                  className="input"
                  readOnly
                />
              </div>
            </div>

            {isStudent && (
              <div className="field-column">
                <label className="label">
                  {getAcademicLabel(instituteData?.institute_type)} :
                </label>
                <div className="input-box">
                  <input
                    type="text"
                    value={userData.standard_type}
                    className="input"
                    readOnly
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save / Cancel - enabled only when something editable has changed */}
      {/* <div className="buttons">
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={!isEdited}
          style={{
            opacity: isEdited ? 1 : 0.5,
            cursor: isEdited ? "pointer" : "not-allowed",
          }}
        >
          <FaSave style={{ marginRight: "10px" }} />
          Save
        </button>
        <button
          className="cancel-btn"
          onClick={handleCancel}
          disabled={!isEdited}
          style={{
            opacity: isEdited ? 1 : 0.5,
            cursor: isEdited ? "pointer" : "not-allowed",
          }}
        >
          <FaTimesCircle style={{ marginRight: "10px" }} />
          Cancel
        </button>
      </div> */}

      <button
        className="save-btn"
        onClick={() => setShowDeleteModal(true)}
      >
        <FaSave style={{ marginRight: "10px" }} />
        Delete Account
      </button>

      {/* Toast Notification */}
      {toast.visible && (
        <div className="toast-notification">
          <FaSave style={{ marginRight: "10px" }} />
          {toast.message}
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-account-modal">

            <div className="delete-modal-header">
              <span className="warning-icon">⚠️</span>
              <h2>Delete Account</h2>
            </div>

            <p className="delete-message">
              Are you sure you want to permanently delete your account?
            </p>

            <div className="delete-warning-box">
              <h4>Before proceeding, please note:</h4>

              <ol>
                <li>
                  Please download all your <strong>Certificates</strong> and
                  <strong> Reports</strong> (if any).
                </li>

                <li>
                  Once your account is deleted, all your
                  <strong> quizzes, test history, certificates, reports,
                    payment records, achievements, profile information,</strong>
                  and other associated data will be
                  <strong> permanently removed.</strong>
                </li>

                <li>
                  This action <strong>cannot be undone</strong> and your data
                  <strong> cannot be recovered.</strong>
                </li>
              </ol>
            </div>

            <p className="delete-note">
              If you are absolutely sure, click
              <strong> "Delete Account"</strong> below.
            </p>

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                className="delete-btn"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
