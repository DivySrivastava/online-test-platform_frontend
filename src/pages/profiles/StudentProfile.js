// "use client"npm install

import { useState } from "react";
import "../css/profiles/StudentProfile.css";

//import logo from './images/logo2.png';

function StudentProfile() {
  // STEP 1: Store form data (like a notebook with empty pages)
  const [studentData, setStudentData] = useState({
    name: "",
    fatherName: "",
    email: "",
    mobile: "",
    institutionName: "",
    standard: "",
    institutionType: "",
    district: "",
    state: "",
  });

  // STEP 2: Function that runs when user types in any input
  const handleChange = (event) => {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    console.log(`User typed "${fieldValue}" in ${fieldName} field`);

    setStudentData({
      ...studentData,
      [fieldName]: fieldValue,
    });
  };

  // STEP 3: Save function
  const handleSave = () => {
    console.log("Save button clicked!");
    console.log("All form data:", studentData);
    alert(`Saved! Name: ${studentData.name}, Email: ${studentData.email}`);
  };

  // STEP 4: Clear function
  const handleCancel = () => {
    console.log("Cancel button clicked - clearing all data");
    setStudentData({
      name: "",
      fatherName: "",
      email: "",
      mobile: "",
      institutionName: "",
      standard: "",
      institutionType: "",
      district: "",
      state: "",
    });
  };

  return (
    <div className="container">
      {/* Header Section */}
      <div className="header">
        <h1 className="title">Student</h1>
        <div className="line"></div>
      </div>

      {/* Profile Picture - Shows ONLY on mobile at the TOP */}
      <div className="mobile-profile-section">
        <div className="profile-card">
          <div className="profile-box">
            <img
              src={'/student.png'}
              alt="Student"
              className="profile-image"
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout - Personal Details + Profile Picture side by side */}
      <div className="desktop-main-row">
        {/* Personal Details Card */}
        <div className="card personal-card">
          <h2 className="card-title">Personal Details</h2>

          <div className="field">
            <label className="label">Name :</label>
            <div className="input-box">
              <input
                type="text"
                name="name"
                value={studentData.name}
                onChange={handleChange}
                className="input"
                placeholder="Enter your name"
              />
              <span className="edit-icon">✏️</span>
            </div>
          </div>

          <div className="field">
            <label className="label">Father's Name :</label>
            <div className="input-box">
              <input
                type="text"
                name="fatherName"
                value={studentData.fatherName}
                onChange={handleChange}
                className="input"
                placeholder="Enter father's name"
              />
              <span className="edit-icon">✏️</span>
            </div>
          </div>

          <div className="field">
            <label className="label">E-mail :</label>
            <div className="input-box">
              <input
                type="email"
                name="email"
                value={studentData.email}
                onChange={handleChange}
                className="input"
                placeholder="Enter email address"
              />
              <span className="edit-icon">✏️</span>
            </div>
          </div>

          <div className="field">
            <label className="label">Mobile :</label>
            <div className="input-box">
              <input
                type="tel"
                name="mobile"
                value={studentData.mobile}
                onChange={handleChange}
                className="input"
                placeholder="Enter mobile number"
              />
              <span className="edit-icon">✏️</span>
            </div>
          </div>
        </div>

        {/* Desktop Profile Picture - Shows ONLY on desktop */}
        <div className="desktop-profile-card">
          <div className="profile-box">
            <img
              src={'/student'}
              alt="Student"
              className="profile-image"
            />
          </div>
        </div>
      </div>

      {/* Institutional Details Card */}
      <div className="card-studentProfile">
        <h2 className="card-title">Institutional Details</h2>

        <div className="field">
          <label className="label">Institution Name :</label>
          <div className="input-box">
            <input
              type="text"
              name="institutionName"
              value={studentData.institutionName}
              onChange={handleChange}
              className="input"
              placeholder="Enter institution name"
            />
            <span className="edit-icon">✏️</span>
          </div>
        </div>

        <div className="row">
          <div className="half-field">
            <label className="label">Standard :</label>
            <div className="input-box">
              <input
                type="text"
                name="standard"
                value={studentData.standard}
                onChange={handleChange}
                className="input"
                placeholder="Enter standard"
              />
              <span className="edit-icon">✏️</span>
            </div>
          </div>

          <div className="half-field">
            <label className="label">Institution type :</label>
            <div className="input-box">
              <input
                type="text"
                name="institutionType"
                value={studentData.institutionType}
                onChange={handleChange}
                className="input"
                placeholder="Enter institution type"
              />
              <span className="edit-icon">✏️</span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="half-field">
            <label className="label">District :</label>
            <div className="input-box">
              <input
                type="text"
                name="district"
                value={studentData.district}
                onChange={handleChange}
                className="input"
                placeholder="Enter district"
              />
              <span className="edit-icon">✏️</span>
            </div>
          </div>

          <div className="half-field">
            <label className="label">State:</label>
            <div className="input-box">
              <input
                type="text"
                name="state"
                value={studentData.state}
                onChange={handleChange}
                className="input"
                placeholder="Enter state"
              />
              <span className="edit-icon">✏️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="buttons">
        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
        <button className="cancel-btn" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default StudentProfile;