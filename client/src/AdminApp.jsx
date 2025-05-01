import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AdminChat from './pages/admin/AdminChat';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminContentManager from './pages/admin/AdminContentManager';
import AdminUserManager from './pages/admin/AdminUserManager';
import AdminPopupManager from './pages/admin/AdminPopupManager';
import AdminUserInfoPage from './pages/admin/AdminUserInfoPage';
import AdminUserLevelPage from './pages/admin/AdminUserLevelPage';
import AdminUserReferralPage from './pages/admin/AdminUserReferralPage';
import TeamManagementPage from './pages/admin/TeamManagementPage';
import QuantLeaderboardPage from './pages/admin/QuantLeaderboardPage';
import WalletAdminPage from './pages/admin/WalletAdminPage';
import axios from 'axios';

axios.defaults.withCredentials = true;

export default function AdminApp() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    axios.get("http://54.85.128.211:4000/api/auth/admin/me")
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
    await axios.post("http://54.85.128.211:4000/api/auth/admin-logout");
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
          path="/popup"
          element={admin ? <AdminPopupManager onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard"
          element={admin ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
                <Route
          path="/quantpage"
          element={admin ? <TeamManagementPage onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
         <Route
          path="/quantrank"
          element={admin ? <QuantLeaderboardPage onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/content"
          element={admin ? <AdminContentManager onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route path="/users/info" element={admin ? <AdminUserInfoPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
<Route path="/users/level" element={admin ? <AdminUserLevelPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
<Route path="/users/referral" element={admin ? <AdminUserReferralPage onLogout={handleLogout} /> : <Navigate to="/login" />} />

<Route
    path="/wallet-admin"
    element={admin ? <WalletAdminPage onLogout={handleLogout}/> : <Navigate to="/login" replace/>}
  />
        <Route path="/users" element={admin ? <AdminUserManager /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
