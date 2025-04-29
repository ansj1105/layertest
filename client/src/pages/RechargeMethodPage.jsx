// 📁 src/pages/RechargeMethodPage.jsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';

export default function RechargeMethodPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100">
      {/* 헤더 */}
      <div className="flex items-center p-4">
        <button
          onClick={() => navigate(-1)}
          className="text-yellow-200 hover:text-yellow-100"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">충전 방법</h1>
        {/* 우측 아이콘 자리 비워두거나 필요 시 추가 */}
        <div className="w-6" />
      </div>

      {/* 본문 */}
      <div className="px-4">
        <h2 className="text-sm text-yellow-300 mb-2">충전 방법 선택</h2>

        {/* USDT 항목 */}
        <div
          className="flex items-center bg-[#2c1f0f] rounded-lg p-4 mb-2 cursor-pointer hover:bg-[#3a270e]"
          onClick={() => navigate('/recharge/usdt')}
        >
          <img
            src="/img/usdt.png"
            alt="USDT"
            className="w-6 h-6 mr-4"
          />
          <span className="flex-1">USDT</span>
          <ChevronRightIcon size={20} className="text-yellow-300" />
        </div>
      </div>
    </div>
  );
}
