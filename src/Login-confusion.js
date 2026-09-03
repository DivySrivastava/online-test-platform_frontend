import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const { updateUser } = useContext(UserContext);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [redirect, setRedirect] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", formData);

      const userData = {
        ...response.data,          // Contains token and per
        ...response.data.user,     // Attach full user details if you include it in backend
      };

      updateUser(userData); // Store user in context and localStorage

      if (userData.token) {
        localStorage.setItem("token", userData.token);
        localStorage.setItem("email", formData.identifier);
      }

      setPermissions(response.data.per); // Store permissions
      setRedirect(true); // Trigger redirect via useEffect
    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid email/mobile or password");
    }
  };

  // ✅ Safe redirect using useEffect
  useEffect(() => {
    if (redirect) {
      navigate("/welcome", { state: { per: permissions } });
    }
  }, [redirect, permissions, navigate]);

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          name="identifier"
          value={formData.identifier}
          onChange={handleChange}
          placeholder="Email or Mobile"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
