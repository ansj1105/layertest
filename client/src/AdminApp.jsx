import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
//import AdminChat from './pages/admin/AdminChat';
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
import AdminWalletPage from './pages/admin/AdminWalletPage';
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage';
import TokenSalesAdminPage from './pages/admin/TokenSalesAdminPage';
import TokensAdminPage from './pages/admin/TokensAdminPage';
import TokenLogsPage from './pages/admin/TokenLogsPage';
import ChatAdminLoginPage from './pages/chat/ChatAdminLoginPage';
import ChatAdminUserListPage from './pages/chat/ChatAdminUserListPage';

import axios from 'axios';

axios.defaults.withCredentials = true;

function AdminAppInner() {
  const [admin, setAdmin] = useState(null);
  const [isChecking, setCheck] = useState(true);
  const navigate = useNavigate();

  // 세션 체크 함수
  const checkSession = async () => {
    try {
      const res = await axios.get("/api/auth/admin/me");
      setAdmin(res.data.user || null);
    } catch {
      setAdmin(null);
    } finally {
      setCheck(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('chatAdminToken');
    if (!token) {
      navigate('/chat-admin/login', { replace: true });
      return;
    }
  }, [navigate]);

  // location을 사용해서 현재 경로 확인
  const location = window.location.hash.replace(/^#/, '');

  // 세션 체크가 필요 없는 경로
  const noSessionCheckRoutes = [
    '/login',
    '/chat-admin/login',
    '/chat-admin/users',
    '/chat-admin'
  ];

  if (location === '/chat-admin') {
    return <ChatAdminUserListPage />;
  }

  if (noSessionCheckRoutes.includes(location)) {
    return (
      <Routes>
        <Route path="/login" element={<AdminLogin onLoginSuccess={user => { setAdmin(user); window.location.hash = '/dashboard'; }} />} />
        <Route path="/chat-admin/login" element={<ChatAdminLoginPage />} />
        <Route path="/chat-admin/users" element={<ChatAdminUserListPage />} />
      </Routes>
    );
  }

  if (isChecking) {
    return <div className="text-center mt-20">Loading…</div>;
  }

  const handleLoginSuccess = (user) => {
    setAdmin(user);
    window.location.hash = "/dashboard";
  };
  const handleLogout = async () => {
    await axios.post("/api/auth/admin-logout");
    setAdmin(null);
    window.location.href = "/admin.html#/login";
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<AdminLogin onLoginSuccess={handleLoginSuccess} />} />
      {/* Chat Admin Routes */}
      <Route path="/chat-admin/login" element={<ChatAdminLoginPage />} />
      <Route 
        path="/chat-admin/users" 
        element={admin ? <ChatAdminUserListPage /> : <Navigate to="/chat-admin/login" replace />} 
      />
      {/* 
      <Route
        path="/chat"
        element={admin ? <AdminChat onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />*/}
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
        path="/token"
        element={admin ? <TokensAdminPage onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/tokensales"
        element={admin ? <TokenSalesAdminPage onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/tokenlogs"
        element={admin ? <TokenLogsPage onLogout={handleLogout} /> : <Navigate to="/login" replace />}
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
      <Route
        path="/wallet-withdrawals"
        element={admin ? <AdminWalletPage onLogout={handleLogout}/> : <Navigate to="/login" replace/>}
      />
      <Route
        path="/wallet-withdraw"
        element={admin ? <AdminWithdrawalsPage onLogout={handleLogout}/> : <Navigate to="/login" replace/>}
      />

      <Route path="/users" element={admin ? <AdminUserManager /> : <Navigate to="/login" />} />

    </Routes>
  );
}

export default function AdminApp() {
  return (
    <Router>
      <AdminAppInner />
    </Router>
  );
}
