import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const UserContext = createContext();

export const SESSION_TIMEOUT_MINUTES =
  Number(process.env.REACT_APP_SESSION_TIMEOUT_MINUTES) || 10;

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on app start / refresh
  const loadUserFromToken = async () => {
    const token = localStorage.getItem("token");
    const expiry = localStorage.getItem("sessionExpiry");

    // If expiry already passed (e.g. tab was closed and reopened later), force logout
    if (token && expiry && Date.now() > Number(expiry)) {
      logoutUser();
      setLoading(false);
      return;
    }

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user); // ✅ Full user object

      console.log("Context User:", res.data.user);

      //console.log("User in context", res.data.user);
    } catch (err) {
      logoutUser();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserFromToken();
  }, []);

  const loginUser = async (userData, token) => {
    const expiryTime = Date.now() + SESSION_TIMEOUT_MINUTES * 60 * 1000;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("sessionExpiry", String(expiryTime));

    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    localStorage.removeItem("sessionExpiry");

    setUser(null);

    toast.success("You have been logged out successfully");

    navigate("/login", { replace: true });
  };

  return (
    <UserContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};
