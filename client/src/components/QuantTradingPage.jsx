// 📁 components/QuantTradingPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function QuantTradingPage() {
  const [vipLevels, setVipLevels] = useState([]);
  const [user, setUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vipRes = await axios.get("/api/admin/vip-levels");
        const userRes = await axios.get("/api/auth/me");

        const sortedLevels = vipRes.data.data || vipRes.data;
        sortedLevels.sort((a, b) => a.level - b.level);
        setVipLevels(sortedLevels);

        setUser(userRes.data);
        const currentLevelIndex = sortedLevels.findIndex(v => v.level === userRes.data.vip_level);
        setCurrentIndex(currentLevelIndex);
      } catch (err) {
        console.error("데이터 불러오기 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center text-white">불러오는 중...</div>;

  const currentVIP = vipLevels[currentIndex];

  const handleTrade = async () => {
    const confirmStart = window.confirm("정량 거래를 시작하시겠습니까?");
    if (!confirmStart) return;

    try {
      const res = await axios.post("/api/quant-trade", { amount: 100 }); // 예시 금액
      alert(res.data.message);
    } catch (err) {
      alert("거래 실패: " + (err.response?.data?.error || "오류 발생"));
    }
  };

  return (
    <div className="p-6 text-yellow-100 bg-[#1a1109] min-h-screen">
      <h2 className="text-xl font-bold text-center mb-4">양적 거래</h2>

      <div className="bg-[#2e1c10] rounded p-4 mb-4 text-sm">
        <div>사용 가능 자산: <strong>{user?.usdt_balance} USDT</strong></div>
        <div>오늘의 수입: <strong>{user?.today_earning || 0} USDT</strong></div>
        <div>총 수익: <strong>{user?.total_earning || 0} USDT</strong></div>
      </div>

      <div className="bg-[#342410] p-4 rounded text-sm mb-4">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="text-yellow-500 font-bold text-lg"
          >←</button>
          <div className="text-center flex-grow font-bold text-yellow-300">VIP {currentVIP?.level} 등급</div>
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(vipLevels.length - 1, prev + 1))}
            className="text-yellow-500 font-bold text-lg"
          >→</button>
        </div>

        <div>일일 거래 횟수: {currentVIP?.daily_trade_limit} 회</div>
        <div>수수료율: {currentVIP?.commission_min}% ~ {currentVIP?.commission_max}%</div>
        <div>최대 투자금액: {currentVIP?.max_investment} USDT</div>
        <div>최소 보유금액: {currentVIP?.min_holdings} USDT</div>
        <div>발기인 조건: A-{currentVIP?.min_A}, B-{currentVIP?.min_B}, C-{currentVIP?.min_C}</div>
      </div>

      <button
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded font-bold text-lg mt-4"
        onClick={handleTrade}
      >
        수량화 시작
      </button>
    </div>
  );
}