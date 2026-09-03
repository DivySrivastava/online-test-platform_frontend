import React from "react";

const LogoutButton = () => {
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");  
        window.location.href = "/login"; // Redirect to login page
    };

    return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
