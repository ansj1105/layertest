
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
    axios.get("http://54.85.128.211:4000/api/auth/me")
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await axios.post("http://54.85.128.211:4000/api/auth/logout");
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
import { BrowserRouter as Router, Link } from 'react-router-dom';
import axios from 'axios';
import {UserIcon, MailIcon,  X as CloseIcon,  ChevronRight} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './i18n/index';
import './index.css';
import UserChat from './pages/UserChat';
import MainLanding from './pages/MainLanding';
import BottomNav from './components/BottomNav'; // 추가
import LoginPage from './pages/auth/LoginPage'; // 추가!
import RegisterPage from './pages/auth/RegisterPage'; // 추가!
axios.defaults.withCredentials = true;

export default function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    axios.get("http://54.85.128.211:4000/api/auth/me")
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await axios.post("http://54.85.128.211:4000/api/auth/logout");
    setUser(null);
    window.location.href = "/login";
  };

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
  };


  // 사이드바에 들어갈 메뉴 리스트
  const MENU = [
    { label: t('app.recharge'),      to: '/recharge' },
    { label: t('app.withdraw'),      to: '/withdraw' },
    { label: t('app.customer_service'), to: '/support' },
    { label: t('app.task_center'),   to: '/taskcenter' },
    { label: t('app.wallets'),       to: '/funding' },
    { label: t('app.faq'),           to: '/commonproblem' },
    { label: t('app.security_center'), to: '/security' },
    { label: t('app.tutorial'),      to: '/quant-tutorial' },
    { label: t('app.language'),      to: '/settings/language' },
    { label: t('app.company'),       to: '/company' },
    { label: t('app.download'),      to: '/download' },
  ];

  if (!user && !["/register", "/test"].includes(window.location.pathname))  {
    return <LoginPage />;
  }
  

  return (
<Router>

    <div
    className="min-h-screen w-full max-w-[500px] mx-auto bg-cover bg-center flex flex-col"
    style={{ backgroundImage: "url('/bg.jpg')" }}
  >
    {/* 상단 바 */}
    <div className="bg-black/60 text-white px-4 py-3 flex justify-between items-center shadow-md">
      {/* User 아이콘 클릭 */}
      <button onClick={()=>setSidebarOpen(true)}>
        <UserIcon size={24} className="text-yellow-300"/>
      </button>
      <span className="text-lg font-semibold">Quantvine</span>
      <MailIcon size={24} className="text-yellow-300"/>
    </div>

    {/* 사이드바 오버레이 */}
    {sidebarOpen && (
      <div className="fixed inset-0 z-50 flex">
        {/* Dimmed 백드롭 클릭 시 닫기 */}
        <div
          className="fixed inset-0 bg-black/50"
          onClick={()=>setSidebarOpen(false)}
        />
        {/* 실제 사이드바 */}
        <div className="relative w-64 bg-[#1a1109] text-yellow-100 p-4 overflow-y-auto">
          {/* 닫기 버튼 */}
          <button
            className="absolute top-4 right-4 text-yellow-300"
            onClick={()=>setSidebarOpen(false)}
          >
            <CloseIcon size={20}/>
          </button>

          {/* 프로필 헤더 */}
          <div className="flex items-center space-x-3 mb-6 mt-4">
            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-xl">
              {user.name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-yellow-300">
                ID:{' '}
                {(() => {
                  const ob = user.id ^ 0xA5A5A5A5;
                  return ob.toString(16).toUpperCase().padStart(8,'0');
                })()}
              </p>
            </div>
          </div>

          <hr className="border-yellow-700 mb-4"/>

          {/* 메뉴 리스트 */}
          <nav className="space-y-2">
            {MENU.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="flex justify-between items-center p-2 rounded hover:bg-yellow-800"
                onClick={()=>setSidebarOpen(false)}
              >
                <span>{item.label}</span>
                <ChevronRight size={16}/>
              </Link>
            ))}
          </nav>

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

    {user && <UserChat userId={user.id} />}
    <MainLanding user={user}/>
    <BottomNav />
  </div>
</Router>
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