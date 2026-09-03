import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./contexts/UserContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  // ⛔ IMPORTANT: Don't redirect while loading user
  if (loading) return null; // or loader/spinner

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

