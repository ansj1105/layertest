import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AdminChat from './pages/admin/AdminChat';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import axios from 'axios';

axios.defaults.withCredentials = true;

export default function AdminApp() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:4000/api/auth/admin/me")
      .then(res => {
        if (res.data.user?.isAdmin) {
          setAdmin(res.data.user);
        } else {
          setAdmin(null);
        }
      })
      .catch(() => setAdmin(null));
  }, []);

  const handleLogout = async () => {
    await axios.post("http://localhost:4000/api/auth/admin-logout");
    setAdmin(null);
    window.location.href = "/admin.html#/login";
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route
          path="/chat"
          element={admin ? <AdminChat onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard"
          element={admin ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}
