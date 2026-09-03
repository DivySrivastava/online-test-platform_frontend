import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data.user))
        .catch(() => {
          logout();   // <-- use global logout
        });
    }
  }, []);

  // ✅ GLOBAL LOGOUT FUNCTION
  const logout = () => {
    localStorage.clear();
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");  // redirect

  };

  const isLoggedIn = () => !!localStorage.getItem("token");

  return { user, isLoggedIn, logout };
}
