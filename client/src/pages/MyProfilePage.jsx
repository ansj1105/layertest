// 📁 src/pages/MyProfilePage.jsx
import {useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ClipboardCopy,
  RefreshCw,
  ArrowDownCircle,
  FileText,
  LogOut
} from 'lucide-react';

axios.defaults.withCredentials = true;

/** 간단한 가역 인코딩 (XOR → 16진수, 8자리) */
function encodeId(id) {
  const ob = id ^ 0xA5A5A5A5;
  return ob.toString(16).toUpperCase().padStart(8, '0');
}

export default function MyProfilePage() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    // 1) 내 정보
    axios.get('/api/mydata/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));

    // 2) 내 대시보드 요약
    axios.get('/api/mydata/summary')
      .then(res => {
        if (res.data.success) setSummary(res.data.data);
      })
      .catch(() => setSummary(null));
  }, []);

  const handleCopyId = () => {
    const encId = encodeId(user.id);
    navigator.clipboard.writeText(encId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleLogout = async () => {
    await axios.post("http://localhost:4000/api/auth/logout");
    setUser(null);
    window.location.href = "/login";
  };
  const doLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      window.location.href = '/login';
    } catch {
      // 실패 처리
    }
  };

  if (!user || !summary) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1109] text-yellow-100">
        ⏳ 로딩 중...
      </div>
    );
  }

  const encId = encodeId(user.id);

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4 pb-[6rem] space-y-6">
      {/* ── 상단 프로필 ────────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-xl">
            {user.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold">Hi, {user.name}</p>
            <p className="text-sm">VIP{user.vip_level}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-yellow-300">ID: {encId}</span>
          <ClipboardCopy
            size={16}
            className="cursor-pointer text-yellow-300 hover:text-white"
            onClick={handleCopyId}
          />
        </div>
      </div>

      {/* ── 잔액 및 수익 카드 ───────────────────────────────────── */}
      <div className="bg-[#2c1f0f] p-4 rounded-lg border border-yellow-700 space-y-4">
        <div className="flex justify-between">
          <div>
            <p className="text-sm">전체 균형</p>
            <p className="text-2xl font-bold">{summary.balance.total.toFixed(2)} USDT</p>
          </div>
          <div>
            <p className="text-sm">총 수익</p>
            <p className="text-2xl font-bold">
              {(
                summary.earnings.referral.total +
                summary.earnings.investment.total +
                summary.earnings.trade.total
              ).toFixed(2)} USDT
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs">오늘 커미션</p>
            <p className="font-semibold">{summary.earnings.referral.today.toFixed(2)} USDT</p>
          </div>
          <div>
            <p className="text-xs">오늘 수입</p>
            <p className="font-semibold">
              {(summary.earnings.investment.today + summary.earnings.trade.today).toFixed(2)} USDT
            </p>
          </div>
          <div>
            <p className="text-xs">어제 수입</p>
            <p className="font-semibold">
              {(summary.earnings.investment.yesterday + summary.earnings.trade.yesterday).toFixed(2)} USDT
            </p>
          </div>
        </div>
      </div>

      {/* ── 작업 버튼 ─────────────────────────────────────────── */}
      <div className="flex justify-around">
        <button className="flex flex-col items-center text-yellow-100" onClick={() => navigate("/recharge")}>
          <RefreshCw size={28} className="mb-1" />
          <span className="text-xs" >재충전</span>
        </button>
        <button className="flex flex-col items-center text-yellow-100" onClick={() => navigate("/withdraw")}>
          <ArrowDownCircle size={28} className="mb-1" />
          <span className="text-xs" >출금하기</span>
        </button>
        <button className="flex flex-col items-center text-yellow-100"onClick={() => navigate("/withdraw/history")} >
          <FileText size={28} className="mb-1" />
          <span className="text-xs">세부</span>
        </button>
      </div>

      {/* ── 레퍼럴 계층 현황 ──────────────────────────────────── */}
      <div className="bg-[#2c1f0f] p-4 rounded-lg border border-yellow-700 grid grid-cols-3 text-center">
        <div>
          <p className="text-sm">Level 1</p>
          <p className="font-semibold">{summary.referrals.level2}</p>
        </div>
        <div>
          <p className="text-sm">Level 2</p>
          <p className="font-semibold">{summary.referrals.level3}</p>
        </div>
        <div>
          <p className="text-sm">Level 3</p>
          <p className="font-semibold">{summary.referrals.level4}</p>
        </div>
      </div>

      {/* ── 메뉴 리스트 ───────────────────────────────────────── */}
      <div className="bg-[#2c1f0f] rounded-lg divide-y divide-yellow-700">
        {[
          { icon: '🏆', label: '태스크 센터' ,to :'/taskcenter'},
          { icon: '❓', label: '일반적인 문제',to :'/commonproblem' },
          { icon: '🔒', label: '보안 센터' , to : '/security' },
          { icon: '📈', label: '양자화 튜토리얼' , to: '/quant-tutorial'},
          { icon: '🌐', label: '언어 설정' ,to :'/settings/language'},
          { icon: '🏢', label: '회사 소개', to: '/company' },
          { icon: '⬇️', label: '앱 다운로드', to: '/download' },
        ].map((item, i) => {
          const baseClasses = "flex items-center p-3 text-yellow-100 hover:bg-yellow-900 cursor-pointer";
          // `to`가 있으면 Link, 없으면 그냥 div
          return item.to ? (
            <Link key={i} to={item.to} className={baseClasses}>
              <span className="mr-3 text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ) : (
            <div key={i} className={baseClasses}>
              <span className="mr-3 text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* ── 로그아웃 버튼 ─────────────────────────────────────────── */}
      <div className="text-center mt-4">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="inline-flex items-center text-red-400 hover:underline"
        >
          <LogOut size={16} className="mr-1" />
          Logout
        </button>
      </div>

      {/* ── ID 복사 알림 ───────────────────────────────────────── */}
      {copySuccess && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white py-2 px-4 rounded">
          ID가 복사되었습니다!
        </div>
        
      )}

          {/* ── 로그아웃 확인 모달 ─────────────────────────────────── */}
          {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#2c1f0f] rounded-lg w-80 p-6 text-center space-y-4">
            <p className="text-white text-lg">로그아웃하시겠습니까?</p>
            <div className="flex mt-4 divide-x divide-gray-600">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={doLogout}
                className="flex-1 py-2 text-yellow-400 hover:text-yellow-300"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
