// 📁 components/WithdrawHistoryPage.jsx
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { label: "모두", path: "/withdraw/history" },
  { label: "검토 중", path: "/withdraw/process" },
  { label: "성공", path: "/withdraw/success" },
  { label: "실패하다", path: "/withdraw/failure" },
];

export default function WithdrawHistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-4" >
      <button
onClick={() => {
  console.log("뒤로가기 클릭됨");
  navigate("/withdraw");
}}
  type="button"
  className="text-white text-xl cursor-pointer"
>
  ←
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

      {/* 기록 없음 메시지 */}
      <div className="text-center mt-20">
        <img src="/img/no-data.png" className="w-12 h-12 mx-auto mb-2" alt="기록 없음" />
        <p className="text-sm text-gray-400">기록 없음</p>
      </div>
    </div>
  );
}
