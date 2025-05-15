// 📁 components/WithdrawPage.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react"; // 아이콘 라이브러리 (shadcn-ui)
export default function WithdrawPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-6">
      {/* ✅ 상단 헤더 및 아이콘 */}
      <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => window.history.back()}
        className="flex items-center space-x-1 mb-4 text-yellow-200 hover:text-yellow-100"
      >
        <ArrowLeftIcon size={20} />
        <span>뒤로</span>
      </button>
        <h2 className="text-xl font-bold text-center flex-grow -ml-6">출금방법</h2>
        <button
          onClick={() => navigate("/withdraw/history")}
          className="text-white text-xl"
          title="출금 내역 메뉴"
        >
          📄
        </button>
      </div>

      {/* ✅ 디지털 화폐 선택 */}
      <div
        onClick={() => navigate("/withdraw/method")}
        className="flex items-center justify-between bg-[#2f1f10] px-4 py-4 rounded cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <img src="/img/usdt.png" className="w-6 h-6" alt="usdt" />
          디지털 화폐
        </div>
        <span>{">"}</span>
      </div>
    </div>
  );
}
