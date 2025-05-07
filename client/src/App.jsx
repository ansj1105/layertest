
/*
// 📁 src/App.jsx// 📁 src/App.jsx
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
import SystemNotices from './components/SystemNotices';
import PersonalMessages from './components/PersonalMessages';
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
*/
/*
  /* ✅ 네비게이션 */


import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Link,Routes,Route,useLocation  } from 'react-router-dom';
import axios from 'axios';
import {
  UserIcon,
  MailIcon,
  X as CloseIcon,
  ChevronRight,
  ClipboardCopy,
  RefreshCw,
  ArrowDownCircle,
  Headphones
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './i18n/index';
import './index.css';
import UserChat from './pages/UserChat';
import MainLanding from './pages/MainLanding';
import BottomNav from './components/BottomNav';
import LoginPage from './pages/auth/LoginPage';
import LanguageSettingsPage from './components/LanguageSettingsPage';
import RegisterPage from './pages/auth/RegisterPage'; // 추가!
axios.defaults.withCredentials = true;
/** 간단한 가역 인코딩 (XOR → 16진수, 8자리) */
function encodeId(id) {
  const ob = id ^ 0xA5A5A5A5;
  return ob.toString(16).toUpperCase().padStart(8, '0');
}

export default function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const loc = useLocation();
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
  const handleCopyId = () => {
    const enc = encodeId(user.id);
    navigator.clipboard.writeText(enc);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 1500);
  };

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
  };

  // 1) /register 경로면 오직 회원가입 페이지만
  if (loc.pathname === '/register') {
    return <RegisterPage />;
  }
  if (loc.pathname === '/settings/language') {
    return <LanguageSettingsPage />;
  }
  // 2) /register 가 아니고, 로그인 안된 상태면 로그인 페이지만
  if (!user ) {
    return <LoginPage />;
  }
/*
  if (!user && !["//settings/language", "/test"].includes(window.location.pathname))  {
    return <LoginPage />;
  }
  */

  return (
 
    <div
      className="min-h-screen w-full max-w-[500px] mx-auto bg-white bg-cover bg-center flex flex-col"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* 상단 바 */}
      <div className="bg-[#1D1D27] text-white px-4 py-3 flex justify-between items-center shadow-md">
  {/* 유저 버튼 */}
  <button onClick={() => setSidebarOpen(true)}>
  <div className="bg-[#1F6D79] rounded-full p-1">
      <UserIcon size={32} className="text-white" />
    </div>
  </button>
          {/* 로고 */}
  <img
    src="/img/item/logo/logo.png"      // ← 본인 경로에 맞게 수정
    alt="Upstart"
    className="h-10"              // 높이 24px, 너비는 비율대로
  />
        <MailIcon size={32} className="text-white-300" />
      </div>

      {/* 사이드바 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* 백드롭 */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />

          {/* 실제 사이드바 */}
          <div className="relative w-64 bg-[#1a1109] text-yellow-100 p-4 overflow-y-auto">
            {/* 닫기 버튼 */}
            <button
              className="absolute top-4 right-4 text-yellow-300"
              onClick={() => setSidebarOpen(false)}
            >
              <CloseIcon size={20} />
            </button>

            {/* 프로필 */}
            <div className="flex items-center space-x-3 mb-6 mt-4">
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-xl">
                {user.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{user.name}</p>
                <div className="flex items-center space-x-1 text-xs text-yellow-300">
                  <span>
                    ID: {encodeId(user.id)}
                  </span>
                  <ClipboardCopy
                    size={14}
                    className="cursor-pointer hover:text-white"
                    onClick={handleCopyId}
                  />
                </div>
                {copySuccess && (
                  <p className="text-xs text-green-400">복사되었습니다!</p>
                )}
              </div>
            </div>
            <hr className="border-yellow-700 mb-4"/>

            {/* 1. 재충전 · 출금 · 고객서비스 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Link
                to="/recharge"
                className="flex flex-col items-center p-2 rounded hover:bg-yellow-800"
                onClick={() => setSidebarOpen(false)}
              >
                <RefreshCw size={24} className="mb-1" />
                <span className="text-xs">재충전</span>
              </Link>
              <Link
                to="/withdraw"
                className="flex flex-col items-center p-2 rounded hover:bg-yellow-800"
                onClick={() => setSidebarOpen(false)}
              >
                <ArrowDownCircle size={24} className="mb-1" />
                <span className="text-xs">출금하기</span>
              </Link>
              <Link
                to="/support"
                className="flex flex-col items-center p-2 rounded hover:bg-yellow-800"
                onClick={() => setSidebarOpen(false)}
              >
                <Headphones size={24} className="mb-1" />
                <span className="text-xs">고객 서비스</span>
              </Link>
            </div>

            {/* 기타 메뉴 */}
            {[
              { to: '/taskcenter',    label: t('app.task_center') },
              { to: '/funding',  label: t('app.wallets') },
              { to: '/commonproblem',      label: t('app.faq') },
              { to: '/security', label: t('app.security_center') },
              { to: '/quant-tutorial', label: t('app.tutorial') },
              { to: '/settings/language', label: t('app.language') },
              { to: '/company',  label: t('app.company') },
              { to: '/download', label: t('app.download') },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="flex justify-between items-center p-2 rounded hover:bg-yellow-800"
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.label}</span>
                <ChevronRight size={16}/>
              </Link>
            ))}

            {/* 로그아웃 */}
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                {t('app.logout')}
             
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
  
      <UserChat userId={user.id} />
      <MainLanding user={user} />
      <BottomNav />
    </div>

);
}
         {/* <div className="flex gap-4 flex-wrap justify-center text-sm md:text-base">
          <Link to="/">{t('Home')}</Link>
            <Link to="/wallet">{t('Wallet')}</Link>
            <Link to="/balance">{t('Balance')}</Link>
            <Link to="/transfer">{t('Transfer')}</Link>
            <Link to="/transactions">{t('Transactions')}</Link>
        
            <Link to="/messages/inbox">📬 받은 메시지</Link>
           <Link to="/messages/notices">📢 공지사항</Link> 
      
          </div>
          <div className="text-sm space-x-2 mt-2 md:mt-0">
            🌐
            <button onClick={() => changeLang('ko')} className="hover:underline">한국어</button>
            <button onClick={() => changeLang('en')} className="hover:underline">EN</button>
      
          </div>*/}