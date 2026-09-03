import React, { useState, useContext } from "react";
import { useAxios } from "../api/axiosInstance";
import { useNavigate } from "react-router-dom"; // ✅ Add this
import getLoggedInUser from "../utils/auth";
import "./css/Login.css";
import { UserContext } from "../contexts/UserContext";
import { useParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const axios = useAxios();
  const navigate = useNavigate(); // ✅ For redirection
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    cnfPassword: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState({
    isStrong: false,
    missing: [],
  }); // For new password strength
  const [passwordsMatch, setPasswordsMatch] = useState(true); // For confirming if passwords match
  const API_URL = process.env.REACT_APP_API_URL;
  // const username = getLoggedInUser();
  const { user } = useContext(UserContext);

  const validatePassword = (password) => {
    const criteria = {
      minLength: password.length >= 8,
      Uppercase: /[A-Z]/.test(password),
      Lowercase: /[a-z]/.test(password),
      Number: /[0-9]/.test(password),
      SpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    const isStrong =
      criteria.minLength &&
      criteria.Uppercase &&
      criteria.Lowercase &&
      criteria.Number &&
      criteria.SpecialChar;

    const missing = [];
    if (!criteria.minLength) missing.push("At least 8 characters");
    if (!criteria.Uppercase) missing.push("At least one uppercase letter");
    if (!criteria.Lowercase) missing.push("At least one lowercase letter");
    if (!criteria.Number) missing.push("At least one number");
    if (!criteria.SpecialChar) missing.push("At least one special character");

    return { isStrong, missing };
  };

  const handleChange = (e) => {
    console.log("Token", token);
    const { name, value } = e.target;

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: value,
      };

      // Validate new password
      if (name === "newPassword") {
        const validation = validatePassword(value);
        setPasswordValidation(validation);
      }

      // Check password match whenever either field changes
      if (newFormData.newPassword && newFormData.cnfPassword) {
        setPasswordsMatch(newFormData.newPassword === newFormData.cnfPassword);
      } else {
        setPasswordsMatch(true);
      }

      return newFormData;
    });
  };
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.cnfPassword) {
      toast.error("New Password and Confirm Password do not match");
      return;
    }
    if (!token) {
      const finalData = {
        username: user.username,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      };

      try {
        const res = await axios.post(
          `${API_URL}/auth/reset-password`,
          finalData,
        );
        toast.success(res.data.message);

        // // ✅ Clear localStorage/session
        // localStorage.removeItem("token");
        // localStorage.removeItem("user");
        // localStorage.removeItem("email");

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1500); // Redirect to login page
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Error resetting password",
        );
      }
    } else {
      try {
        const res = await axios.post(
          `${API_URL}/auth/reset-password/${token}`,
          { newPassword: formData.newPassword },
        );

        //toast.success(res.data.message);
        toast.success(res.data.message);

        setTimeout(() => {
          if (user) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/login", { replace: true });
          }
        }, 1500);
      } catch (err) {
        //toast.error(err.response?.data?.message || "Invalid link");
        toast.error(err.response?.data?.message);
      }
    }
  };

  return (
    <div className="reset-from-profile">
      {/**its styling in login.css */}
      <div className="bg-animation">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

      <div className="l-container">
        <h2>Reset Password</h2>
        <form onSubmit={handleResetPasswordSubmit}>
          {!token && (
            <div className="input-group">
              <div className="password-wrapper">
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="oldPassword"
                  placeholder="Enter Old Password"
                  onChange={handleChange}
                  required
                />

                <span
                  className="password-toggle"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
          )}

          <div className="input-group">
            <div className="password-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                onChange={handleChange}
                style={{
                  borderColor:
                    formData.newPassword && passwordValidation.isStrong
                      ? "green"
                      : formData.newPassword && !passwordValidation.isStrong
                        ? "red"
                        : "",
                }}
                required
              />

              <span
                className="password-toggle"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {formData.newPassword && (
              <div>
                {passwordValidation.isStrong ? (
                  <p
                    style={{
                      color: "green",
                      margin: "0.2rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    Strong password ✅!
                  </p>
                ) : (
                  <p
                    style={{
                      color: "red",
                      margin: "0.2rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    Password is weak: {passwordValidation.missing.join(", ")} !
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="input-group">
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="cnfPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
                style={{
                  borderColor:
                    formData.cnfPassword && !passwordsMatch ? "red" : "",
                }}
                required
              />

              <span
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {formData.cnfPassword && (
              <div>
                {passwordsMatch ? (
                  <p
                    style={{
                      color: "green",
                      margin: "0.2rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {" "}
                    Password Match ✅!
                  </p>
                ) : (
                  <p
                    style={{
                      color: "red",
                      margin: "0.2rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    Password doesn't match ❌!
                  </p>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="l-login-btn">
            Reset
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
