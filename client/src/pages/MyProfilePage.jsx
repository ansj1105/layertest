// 📁 src/pages/MyProfilePage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipboardCopy } from 'lucide-react';

axios.defaults.withCredentials = true;

/** 간단한 가역 인코딩 (XOR → 16진수, 8자리) */
function encodeId(id) {
  // 0xA5A5A5A5 은 임의의 키
  const ob = id ^ 0xA5A5A5A5;
  return ob.toString(16).toUpperCase().padStart(8, '0');
}
/** 디코딩이 필요하면 반대로 */
function decodeId(code) {
  const num = parseInt(code, 16);
  return num ^ 0xA5A5A5A5;
}

export default function MyProfilePage() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // 1) 내 정보
    axios.get('/api/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));

    // 2) 내 대시보드 요약
    axios.get('/api/mydata/summary')
      .then(res => {
        if (res.data.success) setSummary(res.data.data);
      })
      .catch(() => setSummary(null));
  }, []);

  if (!user || !summary) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1109] text-yellow-100">
        ⏳ 로딩 중...
      </div>
    );
  }

  const encId = encodeId(user.id);
  const handleCopyId = () => {
    navigator.clipboard.writeText(encId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4 space-y-6">
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
            <p className="text-2xl font-bold">{summary.earnings.referral.total
              + summary.earnings.investment.total
              + summary.earnings.trade.total
            .toFixed(2)} USDT</p>
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
        <button className="flex flex-col items-center">
          <img src="/icons/recharge.svg" alt="충전" className="w-8 h-8 mb-1"/>
          <span className="text-xs">재충전</span>
        </button>
        <button className="flex flex-col items-center">
          <img src="/icons/withdraw.svg" alt="출금" className="w-8 h-8 mb-1"/>
          <span className="text-xs">출금하기</span>
        </button>
        <button className="flex flex-col items-center">
          <img src="/icons/details.svg" alt="세부" className="w-8 h-8 mb-1"/>
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

      {/* ── ID 복사 알림 ───────────────────────────────────────── */}
      {copySuccess && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white py-2 px-4 rounded">
          ID가 복사되었습니다!
        </div>
      )}
    </div>
  );
}
