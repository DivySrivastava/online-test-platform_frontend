import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export const SESSION_TIMEOUT_MINUTES =
  Number(process.env.REACT_APP_SESSION_TIMEOUT_MINUTES) || 10;

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevent logout from being executed multiple times together
  const logoutInProgress = useRef(false);

  // Load user from token
  const loadUserFromToken = useCallback(async () => {
    const token = localStorage.getItem("token");
    const expiry = localStorage.getItem("sessionExpiry");

    // No token
    if (!token) {
      setLoading(false);
      return;
    }

    // Session expired
    if (expiry && Date.now() > Number(expiry)) {
      logoutUser(false);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.user);
      console.log("Context User:", res.data.user);
    } catch (err) {
      // Invalid/expired token
      // Do NOT call logoutUser here if axios interceptor already handled 401
      if (err.response?.status !== 401) {
        logoutUser(false);
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  // LOGIN
  const loginUser = useCallback((userData, token) => {
    const expiryTime =
      Date.now() + SESSION_TIMEOUT_MINUTES * 60 * 1000;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("sessionExpiry", String(expiryTime));

    // Reset logout protection for next session
    logoutInProgress.current = false;

    setUser(userData);
  }, []);

  // LOGOUT
  const logoutUser = useCallback(
    (showToast = true) => {
      // Prevent duplicate logout calls
      if (logoutInProgress.current) {
        return;
      }

      logoutInProgress.current = true;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("username");
      localStorage.removeItem("sessionExpiry");
      localStorage.removeItem("authIdentifier");

      setUser(null);

      navigate("/login", {
        replace: true,
        state: {
          logoutSuccess: showToast,
        },
      });
    },
    [navigate]
  );

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};