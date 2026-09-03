import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useAxios } from "../api/axiosInstance";
import { toast } from "react-toastify";
//import axios from "axios";
import "./css/Login.css";
import App from "../App";
import { responsiveFontSizes } from "@mui/material";
import { FaArrowLeft } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const axios = useAxios();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotUsername, setShowForgotUsername] = useState(false);
  const [type, setType] = useState(""); // default
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const { loginUser } = useContext(UserContext);
  const API_URL = process.env.REACT_APP_API_URL;
  console.log("API_URL =", API_URL);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  // 🚀 BLOCK ALREADY LOGGED-IN USERS
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (redirect) {
      navigate("/dashboard", { state: { per: permissions } });
    }
  }, [redirect, permissions, navigate]);

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
    return isStrong;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const validateIdentifier = (identifier) => {
    if (!identifier || identifier.trim() === "") return false;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{10}$/;

    if (emailPattern.test(identifier) || phonePattern.test(identifier)) {
      return true;
    }

    // username condition
    if (identifier.length >= 3) return true;

    return false;
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setMessage("");
    setEmail("");
  };

  const handleForgotUsernameClick = () => {
    setShowForgotUsername(true);
    setMessage("");
    setEmail("");
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowForgotUsername(false);
    setMessage("");
    setIdentifier("");
    setPassword("");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);

      const { user, token, per } = response.data;

      // Merge permissions into user object
      const userData = {
        ...user,
        permissions: per || [],
      };

      // Store user in context
      loginUser(userData, token);

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("authIdentifier", formData.identifier);
      localStorage.setItem("user", JSON.stringify(userData));

      // Store permissions in state
      setPermissions(userData.permissions);

      toast.success("Login successful! Welcome back 🎉");

      // Redirect
      setRedirect(true);
    } catch (error) {
      console.error("Login error:", error);

      toast.error(error.response?.data?.message || "Login failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let forgot_entity = "";

    if (showForgotPassword) {
      forgot_entity = "password";
    }
    // else if (showForgotUsername) {
    //   forgot_entity = "username";
    // }

    try {
      console.log("forgot_entity", forgot_entity);
      console.log("email", email);
      const res = await axios.post(`${API_URL}/auth/account-recovery`, {
        email,
        forgot_entity,
      });

      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      toast.error(err.response?.data?.message);
    }
  };

  useEffect(() => {
    localStorage.removeItem("authIdentifier");

    setFormData({
      identifier: "",
      password: "",
    });

    setShowPassword(false);
  }, []);
  // ✅ Safe redirect using useEffect

  return (
    <>
      <div className="signup-back">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/")}
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
      </div>

      <div
        className={`body ${showForgotPassword || showForgotUsername ? "forgot-password-active" : ""}`}
      >
        <div className="left-section">
          <div className="bg-animation">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
          <div className="l-container">
            {showForgotPassword && <h2>Forgot Password</h2>}
            {showForgotUsername && <h2>Forgot Username</h2>}
            {!(showForgotPassword || showForgotUsername) ? (
              <form onSubmit={handleLogin} autoComplete="new-password">
                <div className="input-group">
                  <input
                    type="text"
                    name="identifier"
                    autoComplete="new-password"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="username">Username or Email</label>
                  {formData.identifier &&
                    !validateIdentifier(formData.identifier) && (
                      <span className="validation-error">
                        Enter a valid email, phone number, or username.
                      </span>
                    )}
                </div>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder=""
                    style={{
                      borderColor:
                        formData.password && validatePassword(formData.password)
                          ? "green"
                          : "",
                    }}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <div className="options-row">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="show-password"
                      checked={showPassword}
                      onChange={handleShowPassword}
                    />
                    <label htmlFor="show-password">Show Password</label>
                  </div>
                  <div className="forgot-password">
                    <span onClick={handleForgotPasswordClick}>
                      Forgot Password?
                    </span>
                  </div>
                  {/* <div className="forgot-password">
                    <span onClick={handleForgotUsernameClick}>Forgot Username?</span>
                  </div> */}
                </div>
                <button type="submit" className="l-login-btn">
                  Login
                </button>
                {message && <p className="message">{message}</p>}
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <input
                    type="email"
                    id="forgot-username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="forgot-username">Email</label>
                </div>
                {showForgotPassword && (
                  <button type="submit" className="l-login-btn">
                    Send Reset Link
                  </button>
                )}

                {showForgotUsername && (
                  <button type="submit" className="l-login-btn">
                    Submit
                  </button>
                )}

                <div className="back-to-login">
                  <button onClick={handleBackToLogin} className="l-login-btn">
                    Back to Login
                  </button>
                </div>
                {message && <p className="message">{message}</p>}
              </form>
            )}
          </div>
        </div>
        {!(showForgotPassword || showForgotUsername) && (
          <div className="right-section">
            <div className="welcome-log-text">
              <h2>Welcome Back!!</h2>
              <p>
                Welcome back!! We are so happy to have you here. It’s great to
                see you again.
              </p>
              <button onClick={handleSignupClick} className="s-signup-btn">
                No account yet? Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
