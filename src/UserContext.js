import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on app start / refresh
  const loadUserFromToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);  // ✅ Full user object

      console.log("User in context", res.data.user);
    } catch (err) {
      logoutUser();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserFromToken();
  }, []);

  const loginUser = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <UserContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};
