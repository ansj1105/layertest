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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const loc = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/auth/me")
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  // PDF 파일 목록 가져오기
  useEffect(() => {
    if (user) {
      axios.get('/api/content-files')
        .then(res => {
          const pdfFiles = res.data.filter(f => f.type === 'pdf');
          setPdfs(pdfFiles);
        })
        .catch(console.error);
    }
  }, [user]);

  const handleLogout = async () => {
    await axios.post("/api/auth/logout");
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

import './styles/Sidebar.css';
import './styles/topnav.css';
import { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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

// Lazy load components
const UserChat = lazy(() => import('./pages/UserChat'));
const MainLanding = lazy(() => import('./pages/MainLanding'));
const BottomNav = lazy(() => import('./components/BottomNav'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const LanguageSettingsPage = lazy(() => import('./components/LanguageSettingsPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const PWAInstallPrompt = lazy(() => import('./components/PWAInstallPrompt'));
const PWAStatus = lazy(() => import('./components/PWAStatus'));
const PerformanceMonitor = lazy(() => import('./components/PerformanceMonitor'));
const AdvancedLoadingSpinner = lazy(() => import('./components/AdvancedLoadingSpinner'));

axios.defaults.withCredentials = true;
const API_HOST = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
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
  const [pdfs, setPdfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const loc = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/auth/me")
      .then(res => {
        setUser(res.data.user);
        setIsLoading(false);
      })
      .catch(() => {
        setUser(null);
        setIsLoading(false);
      });
  }, []);

  // PDF 파일 목록 가져오기
  useEffect(() => {
    if (user) {
      axios.get('/api/content-files')
        .then(res => {
          const pdfFiles = res.data.filter(f => f.type === 'pdf');
          setPdfs(pdfFiles);
        })
        .catch(console.error);
    }
  }, [user]);

  const handleLogout = async () => {
    await axios.post("/api/auth/logout");
    setUser(null);
    window.location.href = "/login";
  };

  const handleCopyId = () => {
    const enc = encodeId(user.id);
    console.log('복사 시도:', enc);

    navigator.clipboard.writeText(enc)
      .then(() => {
        console.log('복사 성공');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 1500);
      })
      .catch((err) => {
        console.error('복사 실패:', err);
        alert(`ID: ${enc}\n\n복사가 실패했습니다. 위 ID를 수동으로 복사해주세요.`);
      });
  };

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
  };

  // 로딩 중이거나 모든 컴포넌트가 로드되지 않았으면 로딩 스피너 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cover bg-center flex flex-col" style={{ backgroundImage: "url('/bg.jpg')" }}>
        <AdvancedLoadingSpinner text="Loading Vietcoin..." />
      </div>
    );
  }

  // 1) /register 경로면 오직 회원가입 페이지만
  if (loc.pathname === '/register') {
    return (
      <div className="min-h-screen bg-cover bg-center flex flex-col" style={{ backgroundImage: "url('/bg.jpg')" }}>
        <Suspense fallback={<AdvancedLoadingSpinner text="Loading..." />}>
          <RegisterPage />
        </Suspense>
      </div>
    );
  }

  // 2) /forgot-password 경로면 비밀번호 찾기 페이지만
  if (loc.pathname === '/forgot-password') {
    return (
      <div className="min-h-screen bg-cover bg-center flex flex-col" style={{ backgroundImage: "url('/bg.jpg')" }}>
        <Suspense fallback={<AdvancedLoadingSpinner text="Loading..." />}>
          <ForgotPassword />
        </Suspense>
      </div>
    );
  }

  // 3) /settings/language 경로면 언어 설정 페이지만
  if (loc.pathname === '/settings/language') {
    return (
      <div className="min-h-screen bg-cover bg-center flex flex-col" style={{ backgroundImage: "url('/bg.jpg')" }}>
        <Suspense fallback={<AdvancedLoadingSpinner text="Loading..." />}>
          <LanguageSettingsPage />
        </Suspense>
      </div>
    );
  }

  // 4) 로그인 안된 상태면 로그인 페이지만
  if (!user) {
    return (
      <div className="min-h-screen bg-cover bg-center flex flex-col" style={{ backgroundImage: "url('/bg.jpg')" }}>
        <Suspense fallback={<AdvancedLoadingSpinner text="Loading..." />}>
          <LoginPage />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="top-container" style={{ backgroundImage: "url('/bg.jpg')" }}>
      {/* 상단 바 */}
      <div className="top-nav-bar ">
        {/* 유저 버튼 */}
        <div className="btn-avatar">
          <button className="avatar-button" onClick={() => setSidebarOpen(true)}>
            <img
              src="/img/item/top/avatar.png"
              alt={t('app.userAvatarAlt')}
              className="avatar-img"
            />
          </button>
        </div>

        {/* 로고 */}
        <img
          src="/img/item/logo/logo.png"
          alt={t('app.logoAlt')}
          className="top-logo"
        />

        {/* 메일 아이콘 */}
        <div className="avatar-mase">
          <a
            href={pdfs.length > 0 ? `${API_HOST}${pdfs[0].file_path}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={pdfs.length === 0 ? 'cursor-not-allowed opacity-50' : ''}
          >
            <img
              src="/img/item/top/envelope.png"
              alt={t('app.mailIconAlt')}
              className="avatar-img"
            />
          </a>
        </div>
      </div>

      {/* 사이드바 */}
      {sidebarOpen && (
        <div className="sidebar-overlay">
          {/* 백드롭 */}
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          />

          {/* 사이드바 본체 */}
          <div className="sidebar-panel">
            {/* 닫기 버튼 */}
            <button
              className="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label={t('app.closeButton')}
            >
              <CloseIcon size={20} />
            </button>

            {/* 프로필 */}
            <div className="sidebar-profile">
              <div className="sidebar-avatar">
                {user.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="sidebar-username">{user.name}</p>
                <div className="sidebar-id">
                  <span>{t('app.idLabel')}: {encodeId(user.id)}</span>
                  <ClipboardCopy
                    size={14}
                    className="cursor-pointer hover:text-white"
                    onClick={handleCopyId}
                  />
                </div>
                {copySuccess && (
                  <p className="sidebar-copy-success">{t('app.idCopied')}</p>
                )}
              </div>
            </div>

            <hr className="custom-hr" />

            {/* 상단 메뉴 (재충전, 출금, 고객서비스) */}
            <div className="sidebar-grid">
              <Link to="/recharge" onClick={() => setSidebarOpen(false)}>
                <RefreshCw size={24} className="mb-1" />
                <span className="text-xs">{t('app.recharge')}</span>
              </Link>
              <Link to="/withdraw" onClick={() => setSidebarOpen(false)}>
                <ArrowDownCircle size={24} className="mb-1" />
                <span className="text-xs">{t('app.withdraw')}</span>
              </Link>
              <Link to="/support" onClick={() => setSidebarOpen(false)}>
                <Headphones size={24} className="mb-1" />
                <span className="text-xs">{t('app.customerService')}</span>
              </Link>
            </div>

            {/* 기타 메뉴 */}
            {[
              { to: '/taskcenter', label: t('app.task_center') },
              { to: '/funding', label: t('app.wallets') },
              { to: '/commonproblem', label: t('app.faq') },
              { to: '/security', label: t('app.security_center') },
              { to: '/quant-tutorial', label: t('app.tutorial') },
              { to: '/settings/language', label: t('app.language') },
              { to: '/company', label: t('app.company') },
              { to: '/download', label: t('app.download') },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="sidebar-menu-item"
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.label}</span>
                <ChevronRight size={16} />
              </Link>
            ))}

            {/* 로그아웃 버튼 */}
            <div className="sidebar-logout">
              <button
                onClick={handleLogout}
                className="sidebar-logout-btn"
              >
                {t('app.logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="pt-16 ">
        <Suspense fallback={<AdvancedLoadingSpinner text="Loading..." />}>
          <UserChat userId={user.id} />
          <MainLanding user={user} />
          <BottomNav />
        </Suspense>
      </div>

      {/* PWA 설치 프롬프트 */}
      <Suspense fallback={null}>
        <PWAInstallPrompt />
      </Suspense>

      {/* PWA 상태 표시 */}
      <Suspense fallback={null}>
        <PWAStatus />
      </Suspense>

      {/* 성능 모니터링 (개발 환경에서만) */}
      {/* <Suspense fallback={null}>
        <PerformanceMonitor />
      </Suspense> */}
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