
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
import { BrowserRouter as Router, Link } from 'react-router-dom';
import axios from 'axios';
import { Trash2, ArrowLeft, Mail, MailOpen,ArrowLeftIcon,UserIcon,MailIcon,BellIcon } from 'lucide-react';
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
  {(!user && !["/register", "/test"].includes(window.location.pathname)) ? (
    <LoginPage />
  ) : (
    <div
    className="min-h-screen w-full max-w-[500px] mx-auto bg-cover bg-center flex flex-col"
    style={{ backgroundImage: "url('/bg.jpg')" }}
  >
        {/* ✅ 네비게이션 */}
        
        <div className="bg-black/60 text-white px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-2 shadow-md">
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

<div className="flex justify-between items-center w-full px-4">
      {/* 좌측: 유저 로고 + 텍스트 */}
      <div className="flex items-center space-x-2">
        <UserIcon size={24} />
              <button onClick={handleLogout} className="text-red-400 hover:underline">Logout</button>
      </div>
          <div>
      {/* 중앙: 벨 알림 아이콘 */}
      <span className="text-lg font-semibold">Quantvine</span></div>
    <div>
      {/* 우측: 메일 아이콘 */}
      <MailIcon size={24} />
      </div>
    </div>


        </div>
        {user && <UserChat userId={user.id} />}
        {/* ✅ 메인 랜딩 */}
        <MainLanding user={user} />
     {/* ✅ 채팅창 */}
   {/* ✅ 하단 고정 네비게이션 */}
    {/* ✅ 하단 고정 네비게이션 */}
    <BottomNav />
   
      </div>
      
          )}
    </Router>
  );
  console.log(user)
}
