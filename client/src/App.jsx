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
*/// 📁 src/App.jsx// 📁 src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WalletPage from './pages/WalletPage';
import BalancePage from './pages/BalancePage';
import TransferPage from './pages/TransferPage';
import TransactionPage from './pages/TransactionPage';
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProtectedRoute from './components/ProtectedRoute';
import UserChat from './pages/UserChat';
import CoinList from './components/CoinList';
import ContentList from './components/ContentList';
import axios from "axios";
import { useTranslation } from 'react-i18next';
import './i18n/index';
import './index.css'
axios.defaults.withCredentials = true;

export default function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);

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
<div
  className="min-h-screen bg-cover bg-center flex flex-col"
  style={{ backgroundImage: "url('/bg.jpg')" }}
>
  {/* ✅ 네비게이션 */}
  <div className="bg-black/60 text-white px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-2 shadow-md">
    <div className="flex gap-4 flex-wrap justify-center text-sm md:text-base">
      <Link to="/" className="hover:underline">{t('Wallet')}</Link>
      <Link to="/balance" className="hover:underline">{t('Balance')}</Link>
      <Link to="/transfer" className="hover:underline">{t('Transfer')}</Link>
      <Link to="/transactions" className="hover:underline">{t('Transactions')}</Link>
      <Link to="/register" className="hover:underline">{t('Register')}</Link>
      {!user ? (
        <Link to="/login" className="hover:underline">{t('Login')}</Link>
      ) : (
        <button onClick={handleLogout} className="text-red-400 hover:underline">Logout</button>
      )}
    </div>
    <div className="text-sm space-x-2 mt-2 md:mt-0">
      🌐
      <button onClick={() => changeLang('ko')} className="hover:underline">한국어</button>
      <button onClick={() => changeLang('en')} className="hover:underline">EN</button>
    </div>
  </div>
        {/* ✅ 이미지 + 동영상 ContentList 섹션 */}
        <div className="flex justify-center items-center py-6 bg-black/30">
          <ContentList />
        </div>
  {/* ✅ 상단 CoinList 섹션 */}
  <div className="flex justify-center items-center p-6 backdrop-blur-md bg-black/40">
    <CoinList />
  </div>

  {/* ✅ 메인 콘텐츠 (페이지 라우터) */}
  <div className="flex-1 overflow-y-auto p-6 bg-white/80 text-black backdrop-blur-lg">
    <Routes>
      <Route path="/" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
      <Route path="/balance" element={<ProtectedRoute><BalancePage /></ProtectedRoute>} />
      <Route path="/transfer" element={<ProtectedRoute><TransferPage /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><TransactionPage /></ProtectedRoute>} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  </div>

  {/* ✅ 채팅 */}
  {user && <UserChat userId={user.id} />}
</div>
    </Router>
  );
}
