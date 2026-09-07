import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useAxios } from "../api/axiosInstance";
import { toast } from "react-toastify";
import ReactDOM from "react-dom";
//import axios from "axios";
import "./css/Login.css";
import { FaArrowLeft } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showBackBtn, setShowBackBtn] = useState(true);
  const axios = useAxios();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotUsername, setShowForgotUsername] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const { loginUser } = useContext(UserContext);
  const API_URL = process.env.REACT_APP_API_URL;
  //console.log("API_URL =", API_URL);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 10) {
        // scrolling down
        setShowBackBtn(false);
      } else if (currentScrollY < lastScrollY) {
        // scrolling up
        setShowBackBtn(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (location.state?.logoutSuccess) {
      toast.success("You have been logged out successfully", {
        autoClose: 2000,
        toastId: "logout-success",
      });

      navigate("/login", {
        replace: true,
        state: {},
      });
    }
  }, [location.state?.logoutSuccess, navigate]);

  // BLOCK ALREADY LOGGED-IN USERS
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
    setFormData({ identifier: "", password: "" });
  };

  const handleSignupClick = () => {
    toast.dismiss();
    navigate("/signup");
  };

  const [isSubmitting, setIsSubmitting] = useState(false); // 👈 ye upar UseState declarations ke saath add karo

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        skipGlobalLoader: true, // 👈 sirf ye extra config object add karna hai
      });

      const { user, token, per } = response.data;

      const userData = {
        ...user,
        permissions: per || [],
      };

      loginUser(userData, token);

      localStorage.setItem("token", token);
      localStorage.setItem("authIdentifier", formData.identifier);
      localStorage.setItem("user", JSON.stringify(userData));

      setPermissions(userData.permissions);

      toast.success("Login successful! Welcome back 🎉", {
        autoClose: 2000,
        toastId: "login-success",
      });

      setRedirect(true);
    } catch (error) {
      //console.error("Login error:", error);

      toast.error(
        error.response?.data?.message || "Invalid username/email or password",
        {
          autoClose: 2000,
          closeOnClick: true,
          position: "top-right",
        },
      );
    } finally {
      setIsSubmitting(false); // 👈 add karo
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let forgot_entity = "";

    if (showForgotPassword) {
      forgot_entity = "password";
    }

    try {
      console.log("forgot_entity", forgot_entity);
      console.log("email", email);

      const res = await axios.post(
        `${API_URL}/auth/account-recovery`,
        {
          email,
          forgot_entity,
        },
        {
          skipGlobalLoader: true,
        },
      );

      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
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

  const backButton = ReactDOM.createPortal(
    <div className={`signup-back ${showBackBtn ? "" : "back-hidden"}`}>
      <button
        type="button"
        className="login-back-btn"
        onClick={() => navigate("/")}
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>
    </div>,
    document.body,
  );

  return (
    <>
      {backButton}
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
                        Enter a valid email or username.
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
                <button
                  type="submit"
                  className="l-login-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
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
