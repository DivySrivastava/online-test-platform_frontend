import React, { useState, useEffect, useRef } from "react";
import "./css/AdminForm.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
const AdminForm = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const initialState = {
    name: "",
    username: "",
    gender: "",
    mobile: "",
    email: "",
    designation: "",
    password: "",
    confirmPassword: "",
  };
  const [formData, setFormData] = useState(initialState);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const debounceTimeout = useRef(null); // to hold the timeout ID
  const [submittedData, setSubmittedData] = useState(null);
  const [genderDropdown, setGenderDropdown] = useState("");
  const [showDialog, setShowDialog] = useState(false); // for success popup

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/user/add-admin`, formData);
      if (response.status === 200 || response.status === 201) {
        setSubmittedData(formData);
        setShowDialog(true); // Show success dialog
        setFormData(initialState);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);

      // Backend validation error
      if (error.response) {
        alert(error.response.data.message);
        //setMessage(error.response.data.message);
      }
      // Network / server down
      else {
        //setMessage("Error connecting to server.");
        alert("Server not reachable");
      }
    }

    setGenderDropdown("");
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.username &&
      formData.gender &&
      formData.mobile &&
      formData.email &&
      formData.designation &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword
    );
  };

  useEffect(() => {
    if (formData.username.trim() === "" || formData.username === "") {
      setUsernameAvailable(null);
      return;
    }

    // Debounce the API call
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      axios
        .get(`${API_URL}/auth/checkUsername`, {
          params: { username: formData.username },
        })
        .then((response) => {
          setUsernameAvailable(response.data.available);
        })
        .catch((error) => {
          console.error("Error checking username:", error);
          setUsernameAvailable(null);
        });
    }, 500); // 500ms debounce
  }, [formData.username]);

  return (
    <div className="admin-regis-page">
      <div className="bg-animation">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="admin-regis-header">
        <h2>Admin Registration</h2>
      </div>
      <form onSubmit={handleSubmit} className="admin-regis-form">
        <fieldset className="admin-regis-fieldset">
          <legend>Personal Details</legend>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  placeholder="Name"
                  onChange={handleChange}
                  required
                />
              </label>
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <select
                value={genderDropdown}
                onChange={(e) => {
                  const selected = e.target.value;
                  setGenderDropdown(selected);
                  setFormData((prev) => ({
                    ...prev,
                    gender: selected === "Select Gender" ? "" : selected,
                  }));
                }}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  placeholder="Designation"
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="admin-form-group">
              <label>
                <input
                  type="tel"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="admin-form-group">
              <label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>
          </div>
          <div className="admin-form-row">
            {/* <div className='admin-form-group'>
            <label>
              <input
              type="text"
              name="address"
              value={formData.address}
              placeholder='Address'
              onChange={handleChange}
              required
            
            />
            </label>
            
          </div> */}
          </div>
        </fieldset>

        <fieldset className="admin-regis-fieldset">
          <legend>Account Details</legend>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  placeholder="Username"
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            {/* Feedback Message */}
            {formData.username.trim() !== "" && usernameAvailable === true && (
              <p style={{ color: "green", marginTop: "10px" }}>
                ✅ Username is available
              </p>
            )}
            {formData.username.trim() !== "" && usernameAvailable === false && (
              <p style={{ color: "red", marginTop: "10px" }}>
                ❌ Username is already taken
              </p>
            )}
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>
                {" "}
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  placeholder="Password"
                  onChange={handleChange}
                  disabled={!usernameAvailable}
                  required
                />
              </label>
            </div>

            <div className="admin-form-group">
              <label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  disabled={!usernameAvailable}
                  required
                />
              </label>
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          className="admin-regis-btn"
          disabled={!isFormValid()}
        >
          Submit
        </button>
      </form>
      {showDialog && (
        <div className="admin-success-popup">
          <p>✅ Admin Registered Successfully!</p>
          <button onClick={() => setShowDialog(false)}>OK</button>
        </div>
      )}
      {/*
        {submittedData && (
          <div style={styles.result}>
            <h3>Submitted Data</h3>
            <p><strong>Name:</strong> {submittedData.name}</p>
            <p><strong>Email:</strong> {submittedData.email}</p>
            <p><strong>Age:</strong> {submittedData.age}</p>
          </div>
        )}*/}
    </div>
  );
};

export default AdminForm;
