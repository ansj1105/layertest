// 📁 components/WithdrawFailurePage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react"; // 아이콘 라이브러리 (shadcn-ui)
const tabs = [
  { label: "모두", path: "/withdraw/history" },
  { label: "검토 중", path: "/withdraw/process" },
  { label: "성공", path: "/withdraw/success" },
  { label: "실패하다", path: "/withdraw/failure" },
];

export default function WithdrawFailurePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-4">
      <button
        onClick={() => window.history.back()}
        className="flex items-center space-x-1 mb-4 text-yellow-200 hover:text-yellow-100"
      >
        <ArrowLeftIcon size={20} />
        <span>뒤로</span>
      </button>
        <h2 className="text-xl font-bold text-center flex-grow -ml-6">출금 내역</h2>
        <span className="w-6" />
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-yellow-700 text-sm text-yellow-100 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex-1 py-2 text-center border-b-2 ${
              currentPath === tab.path
                ? "border-yellow-400 font-bold"
                : "border-transparent text-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 실패 내역 */}
      <ul className="space-y-3 text-sm">
        <li className="bg-[#2f1f1f] p-4 rounded">2025-04-19 | 200 USDT | 실패 (잔액 부족)</li>
        <li className="bg-[#2f1f1f] p-4 rounded">2025-04-16 | 120 USDT | 실패 (주소 오류)</li>
      </ul>
    </div>
  );
}
