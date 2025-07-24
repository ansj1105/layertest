// 📁 src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import AdvancedLoadingSpinner from "./AdvancedLoadingSpinner";

axios.defaults.withCredentials = true;

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    axios.get("/api/auth/me")
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center py-8">
    <AdvancedLoadingSpinner text="Loading..." />
  </div>;

  return authenticated ? children : <Navigate to="/login" replace />;
}
