    // 📁 MainLanding.jsx
    import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
    import { useEffect, useState } from 'react';
    import axios from 'axios';
    import CoinList from '../components/CoinList';
    import ContentList from '../components/ContentList';
    import WalletPage from './WalletPage';
    import BalancePage from './BalancePage';
    import TransferPage from './TransferPage';
    import TransactionPage from './TransactionPage';
    import SystemNotices from '../components/SystemNotices';
    import NotificationPopup from '../components/NotificationPopup';
    import PersonalMessages from '../components/PersonalMessages';
    import ProtectedRoute from '../components/ProtectedRoute';
    import ForgotPassword from './auth/ForgotPassword';
    import ResetPassword from './auth/ResetPassword';
    import RegisterPage from './auth/RegisterPage';
    import LoginPage from './auth/LoginPage';
    import MyTeamPage from './MyTeamPage';
    import TestPingPage from './TestPingPage';
    import TokenPurchasePage from '../components/TokenPurchasePage';
    import WithdrawPage from '../components/WithdrawPage';
    import WithdrawMethodPage from '../components/WithdrawMethodPage';
    import WithdrawHistoryPage from '../components/WithdrawHistoryPage';
    import WithdrawProcessingPage from '../components/WithdrawProcessingPage';
    import WithdrawSuccessPage from '../components/WithdrawSuccessPage';
    import WithdrawFailurePage from '../components/WithdrawFailurePage';
    export default function MainLanding({ user }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [popupList, setPopupList] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchPopups = async () => {
        const res = await axios.get("http://localhost:4000/api/popups/active");
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
                <h2 className="text-white text-lg font-semibold">홈 콘텐츠</h2>
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
            </div>

            {/* ✅ QVC 토큰 메뉴 */}
            <div className="bg-[#2b1e0f] text-yellow-400 rounded-md mx-6 mt-4 p-4 shadow-md">
                <div className="text-center text-lg font-semibold border-b border-yellow-600 pb-2 mb-2" onClick={() => navigate("/token")}>
                🪙 QVC 토큰
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div className="cursor-pointer flex flex-col items-center" > 
                    <span className="text-2xl">💰</span>
                    재충전
                </div>
                <div className="cursor-pointer flex flex-col items-center"onClick={() => navigate("/withdraw")} >
                    <span className="text-2xl">💸</span>
                    출금
                </div>
                <div className="cursor-pointer flex flex-col items-center">
                    <span className="text-2xl">👥</span>
                    에이전트
                </div>
                <div className="cursor-pointer flex flex-col items-center">
                    <span className="text-2xl">➕</span>
                    친구를 초대
                </div>
                </div>
            </div>

            <div className="flex justify-center items-center p-6 backdrop-blur-md bg-black/40">
                <CoinList />
            </div>

            {showPopup && popupList.length > 0 && (
                <NotificationPopup list={popupList} onClose={handleClosePopup} />
            )}
            </>
        )}

        <div className="flex-1 overflow-y-auto p-6 bg-white/80 text-black backdrop-blur-lg">
            <Routes>
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/balance" element={<ProtectedRoute><BalancePage /></ProtectedRoute>} />
            <Route path="/transfer" element={<ProtectedRoute><TransferPage /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionPage /></ProtectedRoute>} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/test" element={<TestPingPage />} />
            <Route path="/messages/notices" element={<SystemNotices />} />
            <Route path="/messages/inbox" element={<PersonalMessages />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/team" element={<ProtectedRoute><MyTeamPage /></ProtectedRoute>} />
            <Route path="/token" element={<ProtectedRoute><TokenPurchasePage /></ProtectedRoute>} />
            
<Route path="/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />
<Route path="/withdraw/method" element={<ProtectedRoute><WithdrawMethodPage /></ProtectedRoute>} />
<Route path="/withdraw/history" element={<ProtectedRoute><WithdrawHistoryPage /></ProtectedRoute>} />
<Route path="/withdraw/process" element={<ProtectedRoute><WithdrawProcessingPage /></ProtectedRoute>} />
<Route path="/withdraw/success" element={<ProtectedRoute><WithdrawSuccessPage /></ProtectedRoute>} />
<Route path="/withdraw/failure" element={<ProtectedRoute><WithdrawFailurePage /></ProtectedRoute>} />
            </Routes>
        </div>
        </>
    );
    }