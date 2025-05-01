    // 📁 MainLanding.jsx
    import { Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
    import { useEffect, useState } from 'react';
    
    import axios from 'axios';
    import AppDownloadPage from './AppDownloadPage';
    import CoinList from '../components/CoinList';
    import RechargeMethodPage from './RechargeMethodPage';
    import ContentList from '../components/ContentList';
    import WalletPage from './WalletPage';
    import MyProfilePage from './MyProfilePage';
    import BalancePage from './BalancePage';
    import TransferPage from './TransferPage';
    import TransactionPage from './TransactionPage';
    import USDTRechargePage from './USDTRechargePage';
    import SystemNotices from '../components/SystemNotices';
    import NotificationPopup from '../components/NotificationPopup';
    import PersonalMessages from '../components/PersonalMessages';
    import ProtectedRoute from '../components/ProtectedRoute';
    import QuantTradingPage from '../components/QuantTradingPage';
    import ForgotPassword from './auth/ForgotPassword';
    import ResetPassword from './auth/ResetPassword';
    import RegisterPage from './auth/RegisterPage';
    import LoginPage from './auth/LoginPage';
    import MyTeamPage from './MyTeamPage';
    import SecurityCenterPage  from './SecurityCenterPage';
    import TestPingPage from './TestPingPage';
    import CommonProblemsPage from '../components/CommonProblemsPage';
    import CompanyIntroPage from '../components/CompanyIntroPage';
    import EmailBindingPage from '../components/EmailBindingPage';
    import TokenPurchasePage from '../components/TokenPurchasePage';
     import AgencyCooperationPage from '../components/AgencyCooperationPage';
    import WithdrawPage from '../components/WithdrawPage';
    import InviteFriendPage from '../components/InviteFriendPage';
    import WithdrawMethodPage from '../components/WithdrawMethodPage';
    import FundingPage from '../components/FundingPage';
    import LanguageSettingsPage from '../components/LanguageSettingsPage';
    import LoginPasswordPage from '../components/LoginPasswordPage';
    import WithdrawHistoryPage from '../components/WithdrawHistoryPage';
    import WithdrawProcessingPage from '../components/WithdrawProcessingPage';
    import WithdrawSuccessPage from '../components/WithdrawSuccessPage';
    import WithdrawFailurePage from '../components/WithdrawFailurePage';
    import QuantTutorialPage from '../components/QuantTutorialPage';
    import TradePasswordPage from '../components/TradePasswordPage';
    import TaskCenterPage from '../components/TaskCenterPage';
    export default function MainLanding({ user }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [popupList, setPopupList] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchPopups = async () => {
        const res = await axios.get("http://54.85.128.211:4000/api/popups/active");
        setPopupList(res.data);

        const isPopupClosed = localStorage.getItem("popup_closed");
        const unread = isPopupClosed ? 0 : res.data.length;
        setUnreadCount(unread);

        if (location.pathname === "/" && !isPopupClosed && res.data.length > 0) {
            setShowPopup(true);
        }
        };
        fetchPopups();
    }, [location.pathname]);

    const handleClosePopup = () => {
        localStorage.setItem("popup_closed", "true");
        setShowPopup(false);
        setUnreadCount(0);
    };

    const handleManualOpen = () => {
        setShowPopup(true);
    };

    return (
        <>
        {location.pathname === "/" && (
            <>
            <div className="flex justify-center items-center py-6 bg-black/30">
                <ContentList />
            </div>

            <div className="flex justify-between items-center px-6 py-3 bg-black/80">
                
                <button
                onClick={handleManualOpen}
                className="text-white text-sm hover:underline flex items-center relative"
                >
                🔔 알림
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                    {unreadCount}
                    </span>
                )}
                </button>
                <Link to="/messages/notices">📢</Link>
            </div>

            {/* ✅ QVC 토큰 메뉴 */}
            <div className="bg-[#2b1e0f] text-yellow-400 rounded-md  shadow-md">
            <div
  className="text-center text-lg font-semibold border-b border-yellow-600 py-4 mb-2 cursor-pointer"
  onClick={() => navigate("/token")}
>                🪙 QVC 토큰
                </div>
                <div className="grid grid-cols-4 p-6 text-center text-sm">
                <div className="cursor-pointer flex flex-col items-center" onClick={() => navigate("/recharge")}> 
                    <span className="text-2xl">💰</span>
                    재충전
                </div>
                <div className="cursor-pointer flex flex-col items-center"onClick={() => navigate("/withdraw")} >
                    <span className="text-2xl">💸</span>
                    출금
                </div>
                <div className="cursor-pointer flex flex-col items-center" onClick={() => navigate("/agent")}>
                    <span className="text-2xl">👥</span>
                    에이전트
                </div>
                <div className="cursor-pointer flex flex-col items-center" onClick={() => navigate("/invite")}>
                    <span className="text-2xl">➕</span>
                    친구를 초대
                </div>
                </div>
            </div>

            <div className="flex justify-center items-center p-4  backdrop-blur-md bg-gray-800">
                <CoinList />
            </div>

            {showPopup && popupList.length > 0 && (
                <NotificationPopup list={popupList} onClose={handleClosePopup} />
            )}
            </>
        )}

        <div className="flex-1 overflow-y-auto  bg-white/80 text-black backdrop-blur-lg">
            <Routes>
            // ... Routes 내부
            <Route
            path="/funding"
            element={<ProtectedRoute><FundingPage /></ProtectedRoute>}
            />
            <Route path="/commonproblem" element={<ProtectedRoute><CommonProblemsPage   /></ProtectedRoute>} />
            <Route path="/company" element={<ProtectedRoute><CompanyIntroPage   /></ProtectedRoute>} />
            <Route path="/download" element={<ProtectedRoute><AppDownloadPage  /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/quant" element={<ProtectedRoute><QuantTradingPage /></ProtectedRoute>} />
            <Route path="/balance" element={<ProtectedRoute><BalancePage /></ProtectedRoute>} />
            <Route path="/taskcenter" element={<ProtectedRoute><TaskCenterPage /></ProtectedRoute>} />
            <Route path="/transfer" element={<ProtectedRoute><TransferPage /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionPage /></ProtectedRoute>} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/settings/language" element={<LanguageSettingsPage />} />
            <Route path="/test" element={<TestPingPage />} />
            <Route path="/messages/notices" element={<SystemNotices />} />
            <Route path="/messages/inbox" element={<PersonalMessages />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/recharge" element={<ProtectedRoute><RechargeMethodPage /></ProtectedRoute>} />
            <Route path="/recharge/usdt" element={<ProtectedRoute><USDTRechargePage /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><MyTeamPage /></ProtectedRoute>} />
            <Route path="/token" element={<ProtectedRoute><TokenPurchasePage /></ProtectedRoute>} />
            <Route path="/myprofile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><SecurityCenterPage  /></ProtectedRoute>} />
            <Route path="/security/email" element={<ProtectedRoute><EmailBindingPage  /></ProtectedRoute>} />
            <Route path="/security/login-password" element={<ProtectedRoute><LoginPasswordPage  /></ProtectedRoute>} />
            <Route path="/security/trade-password" element={<ProtectedRoute><TradePasswordPage  /></ProtectedRoute>} />
             <Route path="/invite" element={<ProtectedRoute><InviteFriendPage /></ProtectedRoute>} />
             <Route path="/agent" element={<ProtectedRoute><AgencyCooperationPage /></ProtectedRoute>} />
            <Route path="/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />
            <Route path="/withdraw/method" element={<ProtectedRoute><WithdrawMethodPage /></ProtectedRoute>} />
            <Route path="/withdraw/history" element={<ProtectedRoute><WithdrawHistoryPage /></ProtectedRoute>} />
            <Route path="/withdraw/process" element={<ProtectedRoute><WithdrawProcessingPage /></ProtectedRoute>} />
            <Route path="/withdraw/success" element={<ProtectedRoute><WithdrawSuccessPage /></ProtectedRoute>} />
            <Route path="/withdraw/failure" element={<ProtectedRoute><WithdrawFailurePage /></ProtectedRoute>} />
            <Route path="/withdraw/failure" element={<ProtectedRoute><WithdrawFailurePage /></ProtectedRoute>} />
            <Route path="/quant-tutorial" element={<ProtectedRoute><QuantTutorialPage /></ProtectedRoute>} />


            </Routes>
        </div>
        </>
    );
    }