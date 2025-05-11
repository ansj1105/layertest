import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AdminChat from './pages/admin/AdminChat';
import AdminLogin from './pages/admin/AdminLogin';
import AdminInviteRewardsPage from './pages/admin/AdminInviteRewardsPage';
import AdminJoinRewardsPage from './pages/admin/AdminJoinRewardsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminContentManager from './pages/admin/AdminContentManager';
import AdminUserManager from './pages/admin/AdminUserManager';
import AdminPopupManager from './pages/admin/AdminPopupManager';
import AdminWalletSettings from './pages/admin/AdminWalletSettings';
import AdminUserInfoPage from './pages/admin/AdminUserInfoPage';
import AdminUserLevelPage from './pages/admin/AdminUserLevelPage';
import AdminUserReferralPage from './pages/admin/AdminUserReferralPage';
import TeamManagementPage from './pages/admin/TeamManagementPage';
import QuantLeaderboardPage from './pages/admin/QuantLeaderboardPage';
import WalletAdminPage from './pages/admin/WalletAdminPage';
import AdminWalletsPage from './pages/admin/AdminWalletsPage';
import axios from 'axios';

axios.defaults.withCredentials = true;

export default function AdminApp() {

    const [admin, setAdmin]       = useState(null);
    const [isChecking, setCheck]  = useState(true);
  
    // 1) 마운트 직후에만 한 번 세션 확인
    useEffect(() => {
      axios.get("/api/auth/admin/me")
        .then(res => setAdmin(res.data.user || null))
        .catch(() => setAdmin(null))
        .finally(() => setCheck(false));
    }, []);
  
    // 2) 세션 확인 중에는 로딩 화면
    if (isChecking) {
      return <div className="text-center mt-20">Loading…</div>;
    }
  

  const handleLoginSuccess = (user) => {
    setAdmin(user);
    // 로그인 후 대시보드로 이동
    window.location.hash = "/dashboard";
  };
  const handleLogout = async () => {
    await axios.post("/api/auth/admin-logout");
    setAdmin(null);
    window.location.href = "/admin.html#/login";
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AdminLogin onLoginSuccess={handleLoginSuccess} />} />
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
                <Route
          path="/invite-rewards"
          element={admin ? <AdminInviteRewardsPage onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
                        <Route
          path="/admin-rewards"
          element={admin ? <AdminJoinRewardsPage onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route path="/users/info" element={admin ? <AdminUserInfoPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
<Route path="/users/level" element={admin ? <AdminUserLevelPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
<Route path="/users/referral" element={admin ? <AdminUserReferralPage onLogout={handleLogout} /> : <Navigate to="/login" />} />

<Route
    path="/wallet-admin"
    element={admin ? <WalletAdminPage onLogout={handleLogout}/> : <Navigate to="/login" replace/>}
  />
  <Route
    path="/wallet-settings"
    element={admin ? <AdminWalletSettings onLogout={handleLogout}/> : <Navigate to="/login" replace/>}
  />
    <Route
    path="/wallet-deposits"
    element={admin ? <AdminWalletsPage onLogout={handleLogout}/> : <Navigate to="/login" replace/>}
  />
        <Route path="/users" element={admin ? <AdminUserManager /> : <Navigate to="/login" />} />

      </Routes>
    </Router>
  );
}
