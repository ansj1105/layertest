// 📁 src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
<<<<<<< HEAD
    axios.get("http://54.85.128.211:4000/api/auth/me")
=======
    axios.get("/api/auth/me")
>>>>>>> main
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-20">🔐 Checking session...</div>;

  return authenticated ? children : <Navigate to="/login" replace />;
}
