/*import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

// ✅ 프론트: App.jsx - 라우터 구성 추가
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WalletPage from './pages/WalletPage';
import BalancePage from './pages/BalancePage';
import TransferPage from './pages/TransferPage';
import TransactionPage from './pages/TransactionPage';
import RegisterPage from "./pages/auth/RegisterPage";
//import LoginPage from "./pages/auth/LoginPage";

export default function App() {
  return (
    <Router>
      <div className="p-4 space-x-4 border-b mb-6">
        <Link className="text-blue-600" to="/">Wallet</Link>
        <br></br>
        <Link className="text-green-600" to="/balance">Balance</Link>
        <br></br>
        <Link className="text-purple-600" to="/transfer">Transfer</Link>
        <br></br>
        <Link className="text-gray-800" to="/transactions">Transactions</Link>
        <br></br>
        <Link className="text-gray-800" to="/register">register</Link>
        
      </div>

      <Routes>
        <Route path="/" element={<WalletPage />} />
        <Route path="/balance" element={<BalancePage />} />
        <Route path="/transfer" element={<TransferPage />} />
        <Route path="/transactions" element={<TransactionPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}
*/// 📁 src/App.jsx
// 📁 src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import WalletPage from './pages/WalletPage';
import BalancePage from './pages/BalancePage';
import TransferPage from './pages/TransferPage';
import TransactionPage from './pages/TransactionPage';
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from './components/ProtectedRoute';
import axios from "axios";
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import UserChat from './pages/UserChat';
import { useTranslation } from 'react-i18next';
import './i18n/index';

axios.defaults.withCredentials = true;

export default function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);

  // ✅ 세션 체크
  useEffect(() => {
    axios.get("http://localhost:4000/api/auth/me")
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await axios.post("http://localhost:4000/api/auth/logout");
    setUser(null);
    window.location.href = "/login";
  };

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Router>
      <div className="p-4 space-y-2 border-b mb-6">
        <div className="flex justify-between items-center">
          <div className="space-x-4">
            <Link className="text-blue-600" to="/">{t('Wallet')}</Link>
            <Link className="text-green-600" to="/balance">{t('Balance')}</Link>
            <Link className="text-purple-600" to="/transfer">{t('Transfer')}</Link>
            <Link className="text-gray-800" to="/transactions">{t('Transactions')}</Link>
            <Link className="text-gray-800" to="/register">{t('Register')}</Link>
            {!user ? (
              <Link className="text-gray-800" to="/login">{t('Login')}</Link>
            ) : (
              <button onClick={handleLogout} className="text-red-600">Logout</button>
            )}
          </div>
          <div className="space-x-2">
            🌐
            <button onClick={() => changeLang('ko')} className="text-sm">한국어</button>
            <button onClick={() => changeLang('en')} className="text-sm">EN</button>
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="/balance" element={<ProtectedRoute><BalancePage /></ProtectedRoute>} />
        <Route path="/transfer" element={<ProtectedRoute><TransferPage /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><TransactionPage /></ProtectedRoute>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
                  {/* ✅ 로그인한 유저에게만 실시간 채팅창 표시 */}
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
            
      </Routes>
      {user && <UserChat userId={user.id} />}
    </Router>
  );
}