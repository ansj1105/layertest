// 📁 components/WithdrawPage.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react"; // 아이콘 라이브러리 (shadcn-ui)
import '../styles/WithdrawPage.css';
import '../styles/topbar.css';
export default function WithdrawPage() {
  const navigate = useNavigate();

  return (
    <div className="withdraw-wrapper">
      {/* 상단 헤더 */}
      <div className="withdraw-header">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => window.history.back()}
          className="back-button"
        >
          ←
        </button>

        {/* 타이틀 */}
        <div className="withdraw-title">출금방법</div>

        {/* 출금 내역 버튼 (SVG 아이콘 포함) */}
        <button
          onClick={() => navigate("/withdraw/history")}
          className="menu-button"
          title="출금 내역"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            {/* 문서 테두리 */}
            <rect x="4" y="3" width="16" height="18" rx="2" ry="2" />

            {/* 내역 라인들 */}
            <line x1="8" y1="8" x2="16" y2="8" strokeLinecap="round" />
            <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round" />
            <line x1="8" y1="16" x2="12" y2="16" strokeLinecap="round" />

            {/* 출금 화살표 */}
            <path d="M12 18v3m0 0l-2-2m2 2l2-2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>


      {/* ✅ 디지털 화폐 선택 */}
      <div
        onClick={() => navigate("/withdraw/method")}
        className="currency-selector"
      >
        <div className="currency-label">
          <img src="/img/usdt.png" className="currency-icon" alt="usdt" />
          디지털 화폐
        </div>
        <span className="currency-arrow">{'>'}</span>
      </div>
    </div>
  );
}
